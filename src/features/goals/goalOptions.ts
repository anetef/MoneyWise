import type { ImageSourcePropType } from 'react-native';

import type { Goal, GoalIcon } from './types';

/** Ícones que podem ser escolhidos para uma caixinha. */
export const goalIcons: GoalIcon[] = [
  'piggy-bank-outline',
  'airplane-takeoff',
  'shield-lock-outline',
  'home-outline',
  'car-outline',
  'school-outline',
  'gift-outline',
  'heart-outline',
  'hammer-wrench',
  'laptop',
];

/** Categorias de meta (tela "Nova Caixinha"). */
export const goalCategories = [
  'Segurança & Imprevistos',
  'Viagem',
  'Casa',
  'Educação',
  'Veículo',
  'Presente',
  'Saúde',
  'Outros',
];

const covers = {
  travel: require('../../../assets/images/cover-travel.png') as ImageSourcePropType,
  savings: require('../../../assets/images/cover-savings.png') as ImageSourcePropType,
};

/** Imagem de capa do card (as duas imagens do Figma). */
export function goalCover(goal: Pick<Goal, 'icon' | 'categoryLabel'>): ImageSourcePropType {
  const isTravel = goal.categoryLabel === 'Viagem' || goal.icon.startsWith('airplane');
  return isTravel ? covers.travel : covers.savings;
}

/** "Outubro 2025" */
export function formatDeadline(date: Date | null): string {
  if (!date) return 'Sem prazo fixo';
  const s = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de ', ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "15 Dez 2025" */
export function formatShortDate(date: Date): string {
  const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  return `${date.getDate()} ${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}
