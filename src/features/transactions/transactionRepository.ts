import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import { getDb, isFirebaseConfigured } from '@/core/firebase/config';
import { createDemoTransactions } from './demoData';
import type { Transaction, TransactionInput } from './types';

/**
 * Camada de DADOS das transações (Repository Pattern).
 * O hook `useTransactions` usa esta interface; a tela nunca fala com o Firebase.
 */
export interface TransactionRepository {
  /** Escuta em tempo real as transações do usuário, da mais nova para a mais antiga. */
  subscribe(
    userId: string,
    onData: (items: Transaction[]) => void,
    onError?: (error: unknown) => void,
  ): () => void;
  add(userId: string, input: TransactionInput): Promise<void>;
  update(id: string, input: Partial<TransactionInput>): Promise<void>;
  remove(id: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Firestore: coleção /transactions (cada documento tem o userId do dono)
// ---------------------------------------------------------------------------
function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): Transaction {
  const d = snap.data();
  return {
    id: snap.id,
    userId: d.userId,
    type: d.type,
    amount: d.amount,
    categoryId: d.categoryId,
    description: d.description ?? '',
    date: (d.date as Timestamp | undefined)?.toDate() ?? new Date(),
  };
}

class FirestoreTransactionRepository implements TransactionRepository {
  private col() {
    return collection(getDb(), 'transactions');
  }

  subscribe(userId: string, onData: (items: Transaction[]) => void, onError?: (e: unknown) => void) {
    // onSnapshot = atualização em tempo real + funciona com o cache offline.
    const q = query(this.col(), where('userId', '==', userId), orderBy('date', 'desc'));
    return onSnapshot(q, (snap) => onData(snap.docs.map(fromDoc)), onError);
  }

  async add(userId: string, input: TransactionInput) {
    // Sem internet, a escrita fica na fila local e sincroniza depois (RNF-02).
    await addDoc(this.col(), {
      ...input,
      userId,
      date: Timestamp.fromDate(input.date),
      createdAt: serverTimestamp(),
    });
  }

  async update(id: string, input: Partial<TransactionInput>) {
    const data: DocumentData = { ...input, updatedAt: serverTimestamp() };
    if (input.date) data.date = Timestamp.fromDate(input.date);
    await updateDoc(doc(this.col(), id), data);
  }

  async remove(id: string) {
    await deleteDoc(doc(this.col(), id));
  }
}

// ---------------------------------------------------------------------------
// Modo demonstração: lista em memória com os dados de exemplo do Figma
// ---------------------------------------------------------------------------
class DemoTransactionRepository implements TransactionRepository {
  private items = new Map<string, Transaction[]>();
  private listeners = new Map<string, Set<(items: Transaction[]) => void>>();

  private list(userId: string) {
    if (!this.items.has(userId)) this.items.set(userId, createDemoTransactions(userId));
    return this.items.get(userId)!;
  }

  private emit(userId: string) {
    const sorted = [...this.list(userId)].sort((a, b) => b.date.getTime() - a.date.getTime());
    this.listeners.get(userId)?.forEach((l) => l(sorted));
  }

  subscribe(userId: string, onData: (items: Transaction[]) => void) {
    if (!this.listeners.has(userId)) this.listeners.set(userId, new Set());
    this.listeners.get(userId)!.add(onData);
    queueMicrotask(() => this.emit(userId));
    return () => {
      this.listeners.get(userId)?.delete(onData);
    };
  }

  async add(userId: string, input: TransactionInput) {
    this.list(userId).push({ ...input, id: `tx-${Date.now()}`, userId });
    this.emit(userId);
  }

  async update(id: string, input: Partial<TransactionInput>) {
    for (const [userId, list] of this.items) {
      const i = list.findIndex((t) => t.id === id);
      if (i >= 0) {
        list[i] = { ...list[i]!, ...input };
        this.emit(userId);
      }
    }
  }

  async remove(id: string) {
    for (const [userId, list] of this.items) {
      const i = list.findIndex((t) => t.id === id);
      if (i >= 0) {
        list.splice(i, 1);
        this.emit(userId);
      }
    }
  }
}

export const transactionRepository: TransactionRepository = isFirebaseConfigured
  ? new FirestoreTransactionRepository()
  : new DemoTransactionRepository();
