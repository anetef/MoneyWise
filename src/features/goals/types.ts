import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type GoalIcon = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type GoalMember = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  /** Quanto este membro já guardou na caixinha (RF-14). */
  contributed: number;
};

/**
 * Caixinha = meta financeira individual ou compartilhada (coleção `goals`).
 * RF-11 a RF-19.
 */
export type Goal = {
  id: string;
  name: string;
  icon: GoalIcon;
  categoryLabel: string;
  targetAmount: number;
  savedAmount: number;
  /** Prazo da meta; null = "meta sem prazo fixo". */
  deadline: Date | null;
  shared: boolean;
  adminId: string;
  memberIds: string[];
  members: GoalMember[];
  milestoneAlerts: boolean;
  monthlyReminder: boolean;
  createdAt: Date;
};

export type GoalInput = Pick<
  Goal,
  'name' | 'icon' | 'categoryLabel' | 'targetAmount' | 'deadline' | 'shared' | 'milestoneAlerts' | 'monthlyReminder'
>;

export type GoalEntryType = 'deposit' | 'withdraw' | 'yield';

/** Registro dentro de uma caixinha: aporte, retirada ou rendimento (RF-13). */
export type GoalEntry = {
  id: string;
  goalId: string;
  userId: string;
  userName: string;
  type: GoalEntryType;
  amount: number;
  description: string;
  date: Date;
};

export type GoalEntryInput = Pick<GoalEntry, 'type' | 'amount' | 'description'> & { date?: Date };
