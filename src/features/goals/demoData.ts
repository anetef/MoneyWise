import type { AppUser } from '@/features/auth/types';
import type { Goal, GoalEntry } from './types';

/** Caixinhas de exemplo (valores do Figma) para o modo demonstração. */
export function createDemoGoals(user: AppUser): { goals: Goal[]; entries: Map<string, GoalEntry[]> } {
  const now = new Date();
  const monthsFromNow = (m: number) => new Date(now.getFullYear(), now.getMonth() + m, 15);
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);
  const me = { id: user.id, name: user.name, email: user.email };

  const goals: Goal[] = [
    {
      id: 'viagem-japao',
      name: 'Viagem Japão',
      icon: 'airplane-takeoff',
      categoryLabel: 'Viagem',
      targetAmount: 15000,
      savedAmount: 8500,
      deadline: monthsFromNow(6),
      shared: false,
      adminId: me.id,
      memberIds: [me.id],
      members: [{ ...me, role: 'admin', contributed: 8500 }],
      milestoneAlerts: true,
      monthlyReminder: true,
      createdAt: monthsFromNow(-8),
    },
    {
      id: 'reserva-emergencia',
      name: 'Reserva de Emergência',
      icon: 'shield-lock-outline',
      categoryLabel: 'Segurança & Imprevistos',
      targetAmount: 6000,
      savedAmount: 4250,
      deadline: monthsFromNow(3),
      shared: false,
      adminId: me.id,
      memberIds: [me.id],
      members: [{ ...me, role: 'admin', contributed: 4250 }],
      milestoneAlerts: true,
      monthlyReminder: true,
      createdAt: monthsFromNow(-7),
    },
    {
      id: 'paris-trip',
      name: 'Paris Trip',
      icon: 'airplane',
      categoryLabel: 'Viagem',
      targetAmount: 10000,
      savedAmount: 4500,
      deadline: monthsFromNow(10),
      shared: true,
      adminId: me.id,
      memberIds: [me.id, 'bruno'],
      members: [
        { ...me, role: 'admin', contributed: 3000 },
        { id: 'bruno', name: 'Bruno Lima', email: 'bruno@moneywise.app', role: 'member', contributed: 1500 },
      ],
      milestoneAlerts: true,
      monthlyReminder: false,
      createdAt: monthsFromNow(-4),
    },
    {
      id: 'reforma-ape',
      name: 'Reforma do Apê',
      icon: 'hammer-wrench',
      categoryLabel: 'Casa',
      targetAmount: 8000,
      savedAmount: 4200,
      deadline: null,
      shared: true,
      adminId: 'carla',
      memberIds: [me.id, 'carla'],
      members: [
        { id: 'carla', name: 'Carla Dias', email: 'carla@moneywise.app', role: 'admin', contributed: 2700 },
        { ...me, role: 'member', contributed: 1500 },
      ],
      milestoneAlerts: false,
      monthlyReminder: false,
      createdAt: monthsFromNow(-3),
    },
  ];

  const e = (
    goalId: string,
    id: string,
    type: GoalEntry['type'],
    amount: number,
    description: string,
    who: { id: string; name: string },
    date: Date,
  ): GoalEntry => ({ id, goalId, type, amount, description, userId: who.id, userName: who.name, date });
  const bruno = { id: 'bruno', name: 'Bruno Lima' };

  const entries = new Map<string, GoalEntry[]>([
    [
      'reserva-emergencia',
      [
        e('reserva-emergencia', 'r1', 'deposit', 200, 'Economia mensal planejada', me, daysAgo(2)),
        e('reserva-emergencia', 'r2', 'deposit', 500, 'Sobra do mês', me, daysAgo(16)),
        e('reserva-emergencia', 'r3', 'withdraw', 150, 'Retirada para imprevisto', me, daysAgo(25)),
        e('reserva-emergencia', 'r4', 'deposit', 400, 'Renda extra freela', me, daysAgo(42)),
        e('reserva-emergencia', 'r5', 'deposit', 3300, 'Saldo inicial', me, daysAgo(200)),
      ],
    ],
    [
      'paris-trip',
      [
        e('paris-trip', 'p1', 'deposit', 500, 'Aporte', bruno, daysAgo(0)),
        e('paris-trip', 'p2', 'deposit', 1000, 'Aporte', me, daysAgo(14)),
        e('paris-trip', 'p3', 'yield', 24.5, 'Rendimento', me, daysAgo(28)),
        e('paris-trip', 'p4', 'deposit', 1975.5, 'Aporte inicial', me, daysAgo(110)),
        e('paris-trip', 'p5', 'deposit', 1000, 'Aporte inicial', bruno, daysAgo(110)),
      ],
    ],
    ['viagem-japao', [e('viagem-japao', 'j1', 'deposit', 8500, 'Aportes acumulados', me, daysAgo(30))]],
    ['reforma-ape', [e('reforma-ape', 'a1', 'deposit', 1500, 'Aporte', me, daysAgo(20))]],
  ]);

  return { goals, entries };
}
