import type { GoalExtras } from '../../domain/Goal';

/**
 * Opções dos campos extras da meta (L-08).
 *
 * A API guarda ícone e categoria como texto livre (até 50
 * caracteres); o app oferece estas listas fixas. O ícone é
 * guardado pelo nome (`value`), não pelo emoji.
 */
export type GoalIconOption = {
    value: string;
    emoji: string;
    label: string;
};

export const GOAL_ICON_OPTIONS: GoalIconOption[] = [
    { value: 'piggy', emoji: '🐷', label: 'Cofrinho' },
    { value: 'travel', emoji: '✈️', label: 'Viagem' },
    { value: 'home', emoji: '🏠', label: 'Casa' },
    { value: 'car', emoji: '🚗', label: 'Carro' },
    { value: 'study', emoji: '🎓', label: 'Estudos' },
    { value: 'gift', emoji: '🎁', label: 'Presente' },
    { value: 'wedding', emoji: '💍', label: 'Casamento' },
    { value: 'safety', emoji: '🛟', label: 'Reserva' },
];

export const GOAL_CATEGORY_OPTIONS = [
    'Viagem',
    'Casa',
    'Carro',
    'Estudos',
    'Reserva de emergência',
    'Eventos',
    'Outros',
];

/** Opção do ícone guardado, ou undefined se não houver (ou for desconhecido). */
export function findGoalIcon(icon: string | null | undefined): GoalIconOption | undefined {
    return GOAL_ICON_OPTIONS.find((option) => option.value === icon);
}

/** Valores iniciais da Nova Caixinha: o cofrinho que aparece na tela. */
export const NEW_GOAL_EXTRAS: GoalExtras = {
    icon: 'piggy',
    category: null,
    monthlyReminder: false,
    milestonesEnabled: false,
};
