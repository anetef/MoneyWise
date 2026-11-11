import { findGoalIcon } from '../utils/goalOptions';

/**
 * Capas e ícones das Caixinhas.
 *
 * O Figma usa fotos que ainda não foram exportadas como
 * assets. Com um ícone escolhido (L-08), ele vira o ícone e
 * a capa; sem ícone, ficam estes marcadores visuais.
 */
type GoalVisual = {
    cover: string;
    coverColor: string;
    icon: string;
};

const visuals: Record<string, GoalVisual> = {
    'goal-japao': {
        cover: '🗻',
        coverColor: '#F7E4E8',
        icon: '✈',
    },
    'goal-emergencia': {
        cover: '🪨',
        coverColor: '#EFEBE7',
        icon: '⛨',
    },
    'goal-paris': {
        cover: '🧳',
        coverColor: '#E8ECF7',
        icon: '✈',
    },
};

const defaultVisual: GoalVisual = {
    cover: '💰',
    coverColor: '#F3E9E3',
    icon: '◎',
};

export function getGoalVisual(goalId: string, icon?: string | null): GoalVisual {
    const base = visuals[goalId] ?? defaultVisual;
    const chosen = findGoalIcon(icon);

    return chosen ? { ...base, cover: chosen.emoji, icon: chosen.emoji } : base;
}
