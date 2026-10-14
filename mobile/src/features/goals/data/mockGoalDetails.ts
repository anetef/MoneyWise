import type {
    GoalMember,
    GoalPace,
    GoalRecord,
    GoalRecordKind,
} from '../domain/Goal';

type MockGoalDetails = {
    remainingAmount: number;
    pace: GoalPace | null;
    members: GoalMember[];
    /** Todos os registros, do mais recente para o mais antigo. */
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

/**
 * Data relativa ao dia atual, para que os grupos
 * "Hoje" e "Ontem" do extrato façam sentido no mock.
 */
function daysAgo(days: number, time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();

    date.setDate(date.getDate() - days);
    date.setHours(hours, minutes, 0, 0);

    return date.toISOString();
}

function record(
    id: string,
    kind: GoalRecordKind,
    description: string,
    memberName: string | null,
    occurredAt: string,
    amount: number,
): GoalRecord {
    return { id, kind, description, memberName, occurredAt, amount };
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
            record('rec-japao-1', 'deposit', 'Economia mensal planejada', null, daysAgo(4, '20:10'), 1000),
            record('rec-japao-2', 'deposit', 'Décimo terceiro', null, daysAgo(24, '12:00'), 1500),
            record('rec-japao-3', 'withdrawal', 'Reserva da passagem', null, daysAgo(42, '16:45'), 300),
            record('rec-japao-4', 'deposit', 'Economia mensal planejada', null, daysAgo(55, '09:30'), 1000),
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
            record('rec-emergencia-1', 'deposit', 'Economia mensal planejada', null, daysAgo(2, '09:12'), 200),
            record('rec-emergencia-2', 'deposit', 'Sobra do mês', null, daysAgo(13, '18:05'), 500),
            record('rec-emergencia-3', 'withdrawal', 'Retirada para imprevisto', null, daysAgo(22, '14:30'), 150),
            record('rec-emergencia-4', 'deposit', 'Renda extra freela', null, daysAgo(39, '11:00'), 400),
            record('rec-emergencia-5', 'deposit', 'Economia mensal planejada', null, daysAgo(45, '08:30'), 200),
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
            record('rec-paris-1', 'deposit', 'Aporte', 'Bruno', daysAgo(0, '10:23'), 500),
            record('rec-paris-2', 'deposit', 'Aporte', 'Alice', daysAgo(1, '18:40'), 250),
            record('rec-paris-3', 'withdrawal', 'Retirada', 'Bruno', daysAgo(1, '09:15'), 100),
            record('rec-paris-4', 'deposit', 'Aporte', 'Alice', daysAgo(13, '15:00'), 1000),
            record('rec-paris-5', 'deposit', 'Aporte', 'Bruno', daysAgo(30, '19:20'), 1000),
        ],
    },
};
