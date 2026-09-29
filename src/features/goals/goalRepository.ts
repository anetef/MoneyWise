import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore';

import { getDb, isFirebaseConfigured } from '@/core/firebase/config';
import { AppError } from '@/core/utils/errors';
import { DEMO_USER } from '@/features/auth/authRepository';
import type { AppUser } from '@/features/auth/types';
import { createDemoGoals } from './demoData';
import type { Goal, GoalEntry, GoalEntryInput, GoalInput, GoalMember } from './types';

type Unsubscribe = () => void;

/** Camada de DADOS das caixinhas (Repository Pattern). */
export interface GoalRepository {
  /** Caixinhas em que o usuário é membro, em tempo real (RF-16). */
  subscribeAll(user: AppUser, onData: (goals: Goal[]) => void, onError?: (e: unknown) => void): Unsubscribe;
  subscribeOne(goalId: string, onData: (goal: Goal | null) => void, onError?: (e: unknown) => void): Unsubscribe;
  subscribeEntries(goalId: string, onData: (entries: GoalEntry[]) => void, onError?: (e: unknown) => void): Unsubscribe;
  create(user: AppUser, input: GoalInput): Promise<string>;
  update(goalId: string, input: Partial<GoalInput>): Promise<void>;
  remove(goalId: string): Promise<void>;
  /** Registra aporte/retirada e atualiza o saldo da caixinha de uma vez só. */
  addEntry(goalId: string, user: AppUser, input: GoalEntryInput): Promise<void>;
  /** Adiciona um membro pelo e-mail cadastrado no app (RF-11). */
  inviteByEmail(goalId: string, email: string): Promise<GoalMember>;
  removeMember(goalId: string, memberId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Firestore
//   /goals/{goalId}                 → dados da caixinha + mapa de membros
//   /goals/{goalId}/entries/{id}    → histórico de aportes e retiradas
// ---------------------------------------------------------------------------
function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

function goalFromDoc(snap: DocumentSnapshot<DocumentData>): Goal | null {
  const d = snap.data();
  if (!d) return null;
  const membersMap = (d.members ?? {}) as Record<string, Omit<GoalMember, 'id'>>;
  return {
    id: snap.id,
    name: d.name,
    icon: d.icon ?? 'piggy-bank-outline',
    categoryLabel: d.categoryLabel ?? '',
    targetAmount: d.targetAmount ?? 0,
    savedAmount: d.savedAmount ?? 0,
    deadline: toDate(d.deadline),
    shared: !!d.shared,
    adminId: d.adminId,
    memberIds: d.memberIds ?? [],
    members: Object.entries(membersMap)
      .map(([id, m]) => ({ id, ...m }))
      .sort((a, b) => b.contributed - a.contributed),
    milestoneAlerts: d.milestoneAlerts ?? true,
    monthlyReminder: d.monthlyReminder ?? false,
    createdAt: toDate(d.createdAt) ?? new Date(),
  };
}

class FirestoreGoalRepository implements GoalRepository {
  private goals() {
    return collection(getDb(), 'goals');
  }
  private entries(goalId: string) {
    return collection(getDb(), 'goals', goalId, 'entries');
  }

  subscribeAll(user: AppUser, onData: (goals: Goal[]) => void, onError?: (e: unknown) => void) {
    // A Security Rule só libera caixinhas em que o usuário está em memberIds (RN-02).
    const q = query(this.goals(), where('memberIds', 'array-contains', user.id));
    return onSnapshot(
      q,
      (snap) => {
        const goals = snap.docs.map(goalFromDoc).filter((g): g is Goal => !!g);
        onData(goals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      },
      onError,
    );
  }

  subscribeOne(goalId: string, onData: (goal: Goal | null) => void, onError?: (e: unknown) => void) {
    return onSnapshot(doc(this.goals(), goalId), (snap) => onData(goalFromDoc(snap)), onError);
  }

  subscribeEntries(goalId: string, onData: (entries: GoalEntry[]) => void, onError?: (e: unknown) => void) {
    const q = query(this.entries(goalId), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snap) =>
        onData(
          snap.docs.map((s) => {
            const d = s.data();
            return {
              id: s.id,
              goalId,
              userId: d.userId,
              userName: d.userName,
              type: d.type,
              amount: d.amount,
              description: d.description ?? '',
              date: toDate(d.date) ?? new Date(),
            };
          }),
        ),
      onError,
    );
  }

  async create(user: AppUser, input: GoalInput) {
    const ref = await addDoc(this.goals(), {
      ...input,
      deadline: input.deadline ? Timestamp.fromDate(input.deadline) : null,
      savedAmount: 0,
      adminId: user.id,
      memberIds: [user.id],
      members: { [user.id]: { name: user.name, email: user.email, role: 'admin', contributed: 0 } },
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  async update(goalId: string, input: Partial<GoalInput>) {
    const data: DocumentData = { ...input };
    if ('deadline' in input) data.deadline = input.deadline ? Timestamp.fromDate(input.deadline) : null;
    await updateDoc(doc(this.goals(), goalId), data);
  }

  async remove(goalId: string) {
    // Obs.: no Firestore apagar o documento não apaga a subcoleção `entries`.
    // Para o protótipo isso é suficiente; em produção usaríamos uma Cloud Function.
    await deleteDoc(doc(this.goals(), goalId));
  }

  async addEntry(goalId: string, user: AppUser, input: GoalEntryInput) {
    const signed = input.type === 'withdraw' ? -input.amount : input.amount;
    // writeBatch = as duas escritas acontecem juntas (ou nenhuma acontece).
    const batch = writeBatch(getDb());
    batch.set(doc(this.entries(goalId)), {
      ...input,
      date: Timestamp.fromDate(input.date ?? new Date()),
      userId: user.id,
      userName: user.name,
    });
    batch.update(doc(this.goals(), goalId), {
      savedAmount: increment(signed),
      [`members.${user.id}.contributed`]: increment(signed),
    });
    await batch.commit();
  }

  async inviteByEmail(goalId: string, email: string) {
    const normalized = email.trim().toLowerCase();
    const snap = await getDocs(
      query(collection(getDb(), 'users'), where('email', '==', normalized), limit(1)),
    );
    const found = snap.docs[0];
    if (!found) throw new AppError('Nenhuma conta MoneyWise encontrada com este e-mail.');
    const member: GoalMember = {
      id: found.id,
      name: found.data().name ?? normalized,
      email: normalized,
      role: 'member',
      contributed: 0,
    };
    await updateDoc(doc(this.goals(), goalId), {
      shared: true,
      memberIds: arrayUnion(member.id),
      [`members.${member.id}`]: { name: member.name, email: member.email, role: 'member', contributed: 0 },
    });
    return member;
  }

  async removeMember(goalId: string, memberId: string) {
    await updateDoc(doc(this.goals(), goalId), {
      memberIds: arrayRemove(memberId),
      [`members.${memberId}`]: deleteField(),
    });
  }
}

// ---------------------------------------------------------------------------
// Modo demonstração (em memória)
// ---------------------------------------------------------------------------
class DemoGoalRepository implements GoalRepository {
  private goals: Goal[] | null = null;
  private entries = new Map<string, GoalEntry[]>();
  private listeners = new Set<() => void>();
  /** "Contas" que podem ser convidadas no modo demo. */
  private directory = [
    { id: 'bruno', name: 'Bruno Lima', email: 'bruno@moneywise.app' },
    { id: 'carla', name: 'Carla Dias', email: 'carla@moneywise.app' },
  ];

  private ensure(user?: AppUser) {
    if (!this.goals) {
      const seed = createDemoGoals(user ?? DEMO_USER);
      this.goals = seed.goals;
      this.entries = seed.entries;
    }
    return this.goals;
  }

  private emit() {
    queueMicrotask(() => this.listeners.forEach((l) => l()));
  }

  private listen(fn: () => void): Unsubscribe {
    this.listeners.add(fn);
    queueMicrotask(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private find(goalId: string) {
    const goal = this.ensure().find((g) => g.id === goalId);
    if (!goal) throw new AppError('Caixinha não encontrada.');
    return goal;
  }

  subscribeAll(user: AppUser, onData: (goals: Goal[]) => void) {
    return this.listen(() =>
      onData(this.ensure(user).filter((g) => g.memberIds.includes(user.id)).map((g) => ({ ...g }))),
    );
  }

  subscribeOne(goalId: string, onData: (goal: Goal | null) => void) {
    return this.listen(() => {
      const g = this.ensure().find((x) => x.id === goalId);
      onData(g ? { ...g, members: [...g.members].sort((a, b) => b.contributed - a.contributed) } : null);
    });
  }

  subscribeEntries(goalId: string, onData: (entries: GoalEntry[]) => void) {
    return this.listen(() =>
      onData([...(this.entries.get(goalId) ?? [])].sort((a, b) => b.date.getTime() - a.date.getTime())),
    );
  }

  async create(user: AppUser, input: GoalInput) {
    const id = `goal-${Date.now()}`;
    this.ensure(user).unshift({
      ...input,
      id,
      savedAmount: 0,
      adminId: user.id,
      memberIds: [user.id],
      members: [{ id: user.id, name: user.name, email: user.email, role: 'admin', contributed: 0 }],
      createdAt: new Date(),
    });
    this.emit();
    return id;
  }

  async update(goalId: string, input: Partial<GoalInput>) {
    Object.assign(this.find(goalId), input);
    this.emit();
  }

  async remove(goalId: string) {
    this.goals = this.ensure().filter((g) => g.id !== goalId);
    this.emit();
  }

  async addEntry(goalId: string, user: AppUser, input: GoalEntryInput) {
    const goal = this.find(goalId);
    const signed = input.type === 'withdraw' ? -input.amount : input.amount;
    goal.savedAmount += signed;
    const member = goal.members.find((m) => m.id === user.id);
    if (member) member.contributed += signed;
    const list = this.entries.get(goalId) ?? [];
    list.push({ ...input, date: input.date ?? new Date(), id: `e-${Date.now()}`, goalId, userId: user.id, userName: user.name });
    this.entries.set(goalId, list);
    this.emit();
  }

  async inviteByEmail(goalId: string, email: string) {
    const goal = this.find(goalId);
    const normalized = email.trim().toLowerCase();
    const account = this.directory.find((a) => a.email === normalized);
    if (!account) {
      throw new AppError('Nenhuma conta encontrada. No modo demo, use bruno@moneywise.app ou carla@moneywise.app.');
    }
    if (goal.memberIds.includes(account.id)) throw new AppError('Esta pessoa já participa da caixinha.');
    const member: GoalMember = { ...account, role: 'member', contributed: 0 };
    goal.shared = true;
    goal.memberIds.push(member.id);
    goal.members.push(member);
    this.emit();
    return member;
  }

  async removeMember(goalId: string, memberId: string) {
    const goal = this.find(goalId);
    goal.memberIds = goal.memberIds.filter((id) => id !== memberId);
    goal.members = goal.members.filter((m) => m.id !== memberId);
    this.emit();
  }
}

export const goalRepository: GoalRepository = isFirebaseConfigured
  ? new FirestoreGoalRepository()
  : new DemoGoalRepository();
