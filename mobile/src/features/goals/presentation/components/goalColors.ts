import { colors } from '../../../../core/theme';

import type { GoalProgressTone } from '../../domain/Goal';

/**
 * Tons suaves derivados da cor principal, usados nos
 * destaques das telas de Caixinhas conforme o Figma.
 */
export const goalColors = {
    primarySoft: 'rgba(130, 59, 24, 0.08)',
    primaryTint: 'rgba(130, 59, 24, 0.14)',
} as const;

/**
 * Cores de fundo e destaque para cada tom de status
 * devolvido pelo backend.
 */
export const toneColors: Record<
    GoalProgressTone,
    { background: string; accent: string }
> = {
    positive: {
        background: '#FFDCD0',
        accent: colors.primary,
    },
    neutral: {
        background: colors.surface.secondary,
        accent: colors.primary,
    },
    attention: {
        background: '#FEF3C7',
        accent: colors.status.warning,
    },
};
