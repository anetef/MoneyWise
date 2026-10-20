import type {
    AddContributionInput,
    CreateGoalInput,
    Goal,
    GoalDetails,
    GoalMember,
    GoalRecord,
    UpdateGoalInput,
} from '../domain/Goal';
import type { GoalRepository } from '../domain/GoalRepository';

import { mockCurrentUser, mockGoalDetails } from './mockGoalDetails';
import { mockGoals } from './mockGoals';

/** Quantidade de registros exibidos nos detalhes. */
const RECENT_RECORDS_LIMIT = 4;

type MockGoalDetails = (typeof mockGoalDetails)[string];

/** Cópia dos detalhes simulados, para alterar só durante a sessão. */
function cloneDetails(details: MockGoalDetails): MockGoalDetails {
    return {
        ...details,
        members: details.members.map((member) => ({ ...member })),
        records: [...details.records],
    };
}

/**
 * Participação de cada membro no total aportado (RF-14),
 * simulando o que o backend devolveria após um aporte.
 */
function withSharePercents(members: GoalMember[]): GoalMember[] {
    const total = members.reduce((sum, member) => sum + member.contributedAmount, 0);

    return members.map((member) => ({
        ...member,
        sharePercent: total > 0 ? Math.round((member.contributedAmount / total) * 100) : 0,
    }));
}

const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];

function formatDeadline(deadline: Date | null): string | null {
    if (!deadline) {
        return null;
    }

    return `${monthNames[deadline.getMonth()]} ${deadline.getFullYear()}`;
}

/** Data local no formato AAAA-MM-DD. */
function toIsoDate(date: Date | null): string | null {
    if (!date) {
        return null;
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Percentual da meta, simulando o que o backend devolveria
 * após uma alteração do valor objetivo.
 */
function progressPercent(accumulatedAmount: number, targetAmount: number): number {
    if (targetAmount <= 0) {
        return 0;
    }

    return Math.min(Math.round((accumulatedAmount / targetAmount) * 100), 100);
}

/**
 * Repository simulado das Caixinhas.
 *
 * Mantém os dados em memória durante a sessão:
 * Caixinhas criadas aparecem na lista até o
 * aplicativo ser reiniciado.
 */
export class MockGoalRepository implements GoalRepository {
    private goals: Goal[] = [...mockGoals];
    private details: Record<string, MockGoalDetails> = Object.fromEntries(
        Object.entries(mockGoalDetails).map(([id, details]) => [id, cloneDetails(details)]),
    );
    private nextId = 1;
    private nextRecordId = 1;

    /**
     * Detalhes simulados da Caixinha. As criadas na sessão
     * ainda não têm registros nem status de ritmo; o usuário
     * que cria a Caixinha é o Admin (L-17).
     */
    private detailsFor(goal: Goal): MockGoalDetails {
        return this.details[goal.id] ?? {
            remainingAmount: goal.targetAmount - goal.accumulatedAmount,
            pace: null,
            members: [
                {
                    ...mockCurrentUser,
                    role: 'admin' as const,
                    isCurrentUser: true,
                    contributedAmount: 0,
                    sharePercent: 0,
                },
            ],
            records: [],
        };
    }

    async listGoals(): Promise<Goal[]> {
        return [...this.goals];
    }

    async getGoalDetails(goalId: string): Promise<GoalDetails | null> {
        const goal = this.goals.find((item) => item.id === goalId);

        if (!goal) {
            return null;
        }

        const details = this.detailsFor(goal);

        return {
            ...goal,
            ...details,
            // Acompanha alterações do valor objetivo e aportes da sessão.
            remainingAmount: Math.max(goal.targetAmount - goal.accumulatedAmount, 0),
            records: details.records.slice(0, RECENT_RECORDS_LIMIT),
        };
    }

    async listGoalRecords(goalId: string): Promise<GoalRecord[]> {
        return [...(this.details[goalId]?.records ?? [])];
    }

    async createGoal(input: CreateGoalInput): Promise<Goal> {
        const id = `goal-local-${this.nextId}`;
        const groupId = `group-local-${this.nextId}`;
        this.nextId += 1;

        // Simula a resposta do backend para uma Caixinha nova.
        const goal: Goal = {
            id,
            groupId,
            type: input.type,
            name: input.name,
            deadline: toIsoDate(input.deadline),
            deadlineLabel: formatDeadline(input.deadline),
            accumulatedAmount: 0,
            targetAmount: input.targetAmount,
            progress: {
                percent: 0,
                label: 'Recém-criada',
                tone: 'neutral',
            },
        };

        this.goals = [goal, ...this.goals];

        return goal;
    }

    async updateGoal(goalId: string, input: UpdateGoalInput): Promise<Goal | null> {
        const current = this.goals.find((item) => item.id === goalId);

        if (!current) {
            return null;
        }

        // Simula a resposta do backend: o status do progresso (RN01)
        // é mantido; só o percentual acompanha o novo valor objetivo.
        const updated: Goal = {
            ...current,
            name: input.name,
            targetAmount: input.targetAmount,
            deadline: toIsoDate(input.deadline),
            deadlineLabel: formatDeadline(input.deadline),
            progress: {
                ...current.progress,
                percent: progressPercent(current.accumulatedAmount, input.targetAmount),
            },
        };

        this.goals = this.goals.map((item) => (item.id === goalId ? updated : item));

        return updated;
    }

    async addContribution(goalId: string, input: AddContributionInput): Promise<void> {
        const goal = this.goals.find((item) => item.id === goalId);

        if (!goal) {
            throw new Error('Caixinha não encontrada.');
        }

        // Simula a resposta do backend apenas para a demonstração.
        // No aplicativo integrado, estes valores vêm da API.
        const details = this.detailsFor(goal);
        const currentUser = details.members.find((member) => member.isCurrentUser);
        const isShared = goal.type === 'shared';

        const record: GoalRecord = {
            id: `rec-local-${this.nextRecordId}`,
            kind: 'deposit',
            description: input.description?.trim() || (isShared ? 'Aporte' : 'Entrada'),
            memberName: isShared ? (currentUser?.name ?? mockCurrentUser.name) : null,
            occurredAt: new Date().toISOString(),
            amount: input.amount,
        };
        this.nextRecordId += 1;

        const members = details.members.map((member) =>
            member.isCurrentUser
                ? { ...member, contributedAmount: member.contributedAmount + input.amount }
                : member,
        );

        this.details[goalId] = {
            ...details,
            members: withSharePercents(members),
            records: [record, ...details.records],
        };

        // O status do progresso (RN01) é mantido; só o
        // percentual acompanha o novo valor acumulado.
        const accumulatedAmount = goal.accumulatedAmount + input.amount;

        this.goals = this.goals.map((item) =>
            item.id === goalId
                ? {
                    ...item,
                    accumulatedAmount,
                    progress: {
                        ...item.progress,
                        percent: progressPercent(accumulatedAmount, item.targetAmount),
                    },
                }
                : item,
        );
    }
}

export const goalRepository: GoalRepository = new MockGoalRepository();
