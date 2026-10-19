import type { Goal } from '../domain/Goal';

// Dados simulados para desenvolvimento
export const mockGoals: Goal[] = [
    {
        id: 'goal-japao',
        groupId: 'group-japao',
        type: 'individual',
        name: 'Viagem Japão',
        deadline: '2025-10-31',
        deadlineLabel: 'Outubro 2025',
        accumulatedAmount: 8500,
        targetAmount: 15000,
        progress: {
            percent: 56,
            label: 'No ritmo',
            tone: 'neutral',
        },
    },
    {
        id: 'goal-emergencia',
        groupId: 'group-emergencia',
        type: 'individual',
        name: 'Emergência',
        deadline: '2026-12-31',
        deadlineLabel: 'Dezembro 2026',
        accumulatedAmount: 5000,
        targetAmount: 10000,
        progress: {
            percent: 50,
            label: 'No ritmo',
            tone: 'neutral',
        },
    },
    {
        id: 'goal-paris',
        groupId: 'group-paris',
        type: 'shared',
        name: 'Paris Trip 2024',
        deadline: '2024-07-31',
        deadlineLabel: 'Julho 2024',
        accumulatedAmount: 4500,
        targetAmount: 10000,
        progress: {
            percent: 45,
            label: 'No ritmo',
            tone: 'neutral',
        },
    },
];
