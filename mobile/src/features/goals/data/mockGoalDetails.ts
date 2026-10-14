import type { GoalPace, GoalRecord } from '../domain/Goal';

type MockGoalDetails = {
    remainingAmount: number;
    pace: GoalPace | null;
    records: GoalRecord[];
};

// Dados simulados para desenvolvimento, coerentes com mockGoals
export const mockGoalDetails: Record<string, MockGoalDetails> = {
    'goal-japao': {
        remainingAmount: 6500,
        pace: {
            title: 'No ritmo planejado',
            message:
                'Seus registros estão dentro do planejado. Mantendo esse valor, a meta será alcançada no prazo.',
            tone: 'neutral',
        },
        records: [
            {
                id: 'rec-japao-1',
                kind: 'deposit',
                description: 'Economia mensal planejada',
                dateLabel: '10 de Outubro',
                amount: 1000,
            },
            {
                id: 'rec-japao-2',
                kind: 'deposit',
                description: 'Décimo terceiro',
                dateLabel: '20 de Setembro',
                amount: 1500,
            },
            {
                id: 'rec-japao-3',
                kind: 'withdrawal',
                description: 'Reserva da passagem',
                dateLabel: '02 de Setembro',
                amount: 300,
            },
        ],
    },
    'goal-emergencia': {
        remainingAmount: 5000,
        pace: {
            title: 'Ritmo acelerado!',
            message:
                'Você está no ritmo planejado! Mantendo esse valor, a meta será alcançada 1 mês antes do previsto.',
            tone: 'positive',
        },
        records: [
            {
                id: 'rec-emergencia-1',
                kind: 'deposit',
                description: 'Economia mensal planejada',
                dateLabel: '15 de Outubro',
                amount: 200,
            },
            {
                id: 'rec-emergencia-2',
                kind: 'deposit',
                description: 'Sobra do mês',
                dateLabel: '01 de Outubro',
                amount: 500,
            },
            {
                id: 'rec-emergencia-3',
                kind: 'withdrawal',
                description: 'Retirada para imprevisto',
                dateLabel: '22 de Setembro',
                amount: 150,
            },
            {
                id: 'rec-emergencia-4',
                kind: 'deposit',
                description: 'Renda extra freela',
                dateLabel: '05 de Setembro',
                amount: 400,
            },
        ],
    },
};
