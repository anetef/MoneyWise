import type { GoalMember, GoalPace, GoalRecord } from '../domain/Goal';

type MockGoalDetails = {
    remainingAmount: number;
    pace: GoalPace | null;
    members: GoalMember[];
    records: GoalRecord[];
};

/** Usuário da sessão simulada. */
export const mockCurrentUser = {
    id: 'user-alice',
    name: 'Alice',
} as const;

/** Dono de uma Caixinha individual (grupo de um membro, L-06). */
function owner(contributedAmount: number): GoalMember {
    return {
        ...mockCurrentUser,
        role: 'admin',
        isCurrentUser: true,
        contributedAmount,
        sharePercent: 100,
    };
}

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
        members: [owner(8500)],
        records: [
            {
                id: 'rec-japao-1',
                kind: 'deposit',
                memberName: null,
                description: 'Economia mensal planejada',
                dateLabel: '10 de Outubro',
                amount: 1000,
            },
            {
                id: 'rec-japao-2',
                kind: 'deposit',
                memberName: null,
                description: 'Décimo terceiro',
                dateLabel: '20 de Setembro',
                amount: 1500,
            },
            {
                id: 'rec-japao-3',
                kind: 'withdrawal',
                memberName: null,
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
        members: [owner(5000)],
        records: [
            {
                id: 'rec-emergencia-1',
                kind: 'deposit',
                memberName: null,
                description: 'Economia mensal planejada',
                dateLabel: '15 de Outubro',
                amount: 200,
            },
            {
                id: 'rec-emergencia-2',
                kind: 'deposit',
                memberName: null,
                description: 'Sobra do mês',
                dateLabel: '01 de Outubro',
                amount: 500,
            },
            {
                id: 'rec-emergencia-3',
                kind: 'withdrawal',
                memberName: null,
                description: 'Retirada para imprevisto',
                dateLabel: '22 de Setembro',
                amount: 150,
            },
            {
                id: 'rec-emergencia-4',
                kind: 'deposit',
                memberName: null,
                description: 'Renda extra freela',
                dateLabel: '05 de Setembro',
                amount: 400,
            },
        ],
    },
    'goal-paris': {
        remainingAmount: 5500,
        pace: null,
        members: [
            {
                ...mockCurrentUser,
                role: 'admin',
                isCurrentUser: true,
                contributedAmount: 3000,
                sharePercent: 66,
            },
            {
                id: 'user-bruno',
                name: 'Bruno',
                role: 'member',
                isCurrentUser: false,
                contributedAmount: 1500,
                sharePercent: 34,
            },
        ],
        records: [
            {
                id: 'rec-paris-1',
                kind: 'deposit',
                description: 'Aporte',
                memberName: 'Bruno',
                dateLabel: 'Hoje, 10:23',
                amount: 500,
            },
            {
                id: 'rec-paris-2',
                kind: 'deposit',
                description: 'Aporte',
                memberName: 'Alice',
                dateLabel: '15 de Outubro',
                amount: 1000,
            },
            {
                id: 'rec-paris-3',
                kind: 'deposit',
                description: 'Aporte',
                memberName: 'Bruno',
                dateLabel: '01 de Outubro',
                amount: 1000,
            },
        ],
    },
};
