import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { TransactionType } from './types';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type Category = {
  id: string;
  label: string;
  icon: IconName;
  type: TransactionType;
  /** Cor usada nos gráficos do Dashboard. */
  color: string;
};

/** Categorias do Figma (tela "Adicionar Transação") + as de entrada. */
export const categories: Category[] = [
  { id: 'food', label: 'Comida', icon: 'silverware-fork-knife', type: 'expense', color: '#D2C4BA' },
  { id: 'transport', label: 'Transporte', icon: 'car-outline', type: 'expense', color: '#E2E2E7' },
  { id: 'shopping', label: 'Compras', icon: 'shopping-outline', type: 'expense', color: '#B5876B' },
  { id: 'home', label: 'Casa', icon: 'home-outline', type: 'expense', color: '#823B18' },
  { id: 'health', label: 'Saúde', icon: 'heart-pulse', type: 'expense', color: '#A0522D' },
  { id: 'leisure', label: 'Lazer', icon: 'gamepad-variant-outline', type: 'expense', color: '#6B3E26' },
  { id: 'other-expense', label: 'Outros', icon: 'dots-horizontal', type: 'expense', color: '#BEC6E0' },
  { id: 'salary', label: 'Salário', icon: 'briefcase-outline', type: 'income', color: '#006948' },
  { id: 'pix', label: 'Pix', icon: 'bank-transfer-in', type: 'income', color: '#00855B' },
  { id: 'freelance', label: 'Freela', icon: 'laptop', type: 'income', color: '#72442B' },
  { id: 'other-income', label: 'Outros', icon: 'cash-plus', type: 'income', color: '#BEC6E0' },
];

const byId = new Map(categories.map((c) => [c.id, c]));

export function getCategory(id: string): Category {
  return byId.get(id) ?? categories[categories.length - 1]!;
}

export function categoriesFor(type: TransactionType): Category[] {
  return categories.filter((c) => c.type === type);
}
