/**
 * Capas e ícones temporários das Caixinhas.
 *
 * O Figma usa fotos e ícones que ainda não foram
 * exportados como assets, e o campo de ícone da meta
 * depende da decisão L-08. Até lá, a apresentação usa
 * estes marcadores visuais.
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

export function getGoalVisual(goalId: string): GoalVisual {
    return visuals[goalId] ?? defaultVisual;
}
