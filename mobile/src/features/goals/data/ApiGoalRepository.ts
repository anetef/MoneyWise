import { apiRequest, ApiError } from '../../../core/api/apiClient';
import { sessionStore } from '../../../core/storage/sessionStore';
import { createId } from '../../../core/utils/createId';
import type {
    AddContributionInput,
    CreateGoalInput,
    Goal,
    GoalDetails,
    GoalMember,
    GoalRecord,
    GoalType,
    UpdateGoalInput,
} from '../domain/Goal';
import type { GoalRepository } from '../domain/GoalRepository';
import {
    toDeadlineLabel,
    toIsoDate,
    toPace,
    toProgress,
} from './goalMappers';
import { sharedGroupsStore } from './sharedGroupsStore';

// Formatos que a API devolve (iguais ao Swagger).
// Valores em dinheiro chegam como número ou texto (BigDecimal).
type Amount = number | string;

type GoalSummaryResponse = {
    id: string;
    groupId: string;
    name: string;
    icon: string | null;
    category: string | null;
    targetAmount: Amount;
    accumulated: Amount;
    progressPercent: Amount;
    status: string;
    deadline: string | null;
    archived: boolean;
};

type GoalResponse = {
    id: string;
    groupId: string;
    name: string;
    targetAmount: Amount;
    deadline: string | null;
    icon: string | null;
    category: string | null;
    monthlyReminder: boolean;
    milestonesEnabled: boolean;
};

type ThermometerResponse = {
    goalId: string;
    status: string;
    progressPercent: Amount;
    accumulated: Amount;
    targetAmount: Amount;
    remaining: Amount;
    deadline: string | null;
    contributors: { userId: string; name: string | null; total: Amount }[];
};

type GroupResponse = {
    id: string;
    name: string;
    adminId: string;
    members: { userId: string; name: string | null; role: 'ADMIN' | 'MEMBER' }[];
};

type ContributionResponse = {
    id: string;
    type: 'ENTRADA' | 'RETIRADA';
    amount: Amount;
    userId: string | null;
    userName: string | null;
    createdAt: string;
};

type ContributionPageResponse = {
    content: ContributionResponse[];
    page: number;
    hasNext: boolean;
};

/** Registros mostrados no card "Últimos registros" dos detalhes. */
const RECENT_RECORDS_LIMIT = 4;
/** Maior página aceita pela API no histórico. */
const MAX_PAGE_SIZE = 100;
/** Trava de segurança do extrato completo (10 x 100 = 1000 registros). */
const MAX_PAGES = 10;

function money(value: Amount): number {
    return Number(value) || 0;
}

/** Arredonda para centavos antes de enviar (evita 45.900000001). */
function toCentsAmount(value: number): number {
    return Math.round(value * 100) / 100;
}

/**
 * Tipo da Caixinha (L-06): compartilhada quando o grupo tem mais
 * de um membro, ou quando foi criada como compartilhada aqui.
 */
function typeOf(group: GroupResponse | undefined, sharedGroupIds: string[]): GoalType {
    if (!group) {
        return 'individual';
    }

    return group.members.length > 1 || sharedGroupIds.includes(group.id)
        ? 'shared'
        : 'individual';
}

function toGoal(summary: GoalSummaryResponse, type: GoalType): Goal {
    return {
        id: summary.id,
        groupId: summary.groupId,
        type,
        name: summary.name,
        deadline: summary.deadline,
        deadlineLabel: toDeadlineLabel(summary.deadline),
        icon: summary.icon ?? null,
        category: summary.category ?? null,
        accumulatedAmount: money(summary.accumulated),
        targetAmount: money(summary.targetAmount),
        progress: toProgress(summary.status, summary.progressPercent),
    };
}

/**
 * Membros com o quanto cada um aportou (RF-14). Nunca mostra o
 * saldo pessoal do membro (RN08): só o que entrou na Caixinha.
 */
function toMembers(
    group: GroupResponse,
    thermometer: ThermometerResponse,
    currentUserId: string | null,
): GoalMember[] {
    const totals = new Map(
        thermometer.contributors.map((item) => [item.userId, money(item.total)]),
    );
    const sum = [...totals.values()].reduce((total, value) => total + Math.max(value, 0), 0);

    return group.members.map((member) => {
        const contributed = totals.get(member.userId) ?? 0;

        return {
            id: member.userId,
            name: member.name ?? 'Conta excluída',
            role: member.role === 'ADMIN' ? 'admin' : 'member',
            isCurrentUser: member.userId === currentUserId,
            contributedAmount: contributed,
            sharePercent: sum > 0 ? Math.round((Math.max(contributed, 0) / sum) * 100) : 0,
        };
    });
}

function toRecord(item: ContributionResponse, type: GoalType): GoalRecord {
    const isWithdrawal = item.type === 'RETIRADA';

    return {
        id: item.id,
        kind: isWithdrawal ? 'withdrawal' : 'deposit',
        // A API não guarda descrição do movimento; o texto vem do tipo.
        description: isWithdrawal ? 'Retirada' : type === 'shared' ? 'Aporte' : 'Entrada',
        // Movimentos de contas excluídas chegam sem autor (AD-15).
        memberName: type === 'shared' ? (item.userName ?? 'Conta excluída') : null,
        occurredAt: item.createdAt,
        amount: money(item.amount),
    };
}

/** Converte "não encontrado" (404) em null, como a interface pede. */
async function orNullIfNotFound<T>(request: Promise<T>): Promise<T | null> {
    try {
        return await request;
    } catch (e) {
        if (e instanceof ApiError && e.status === 404) {
            return null;
        }

        throw e;
    }
}

/**
 * Repository real das Caixinhas: conversa com a API do MoneyWise.
 *
 * Cada Caixinha é uma meta dentro de um grupo (L-06). Progresso,
 * status e participação vêm calculados do backend (RN01).
 */
export class ApiGoalRepository implements GoalRepository {
    async listGoals(): Promise<Goal[]> {
        const [summaries, groups, sharedGroupIds] = await Promise.all([
            apiRequest<GoalSummaryResponse[]>('/goals'),
            apiRequest<GroupResponse[]>('/groups'),
            sharedGroupsStore.list(),
        ]);

        const groupsById = new Map(groups.map((group) => [group.id, group]));

        // Mais recentes primeiro, como já fazia a versão simulada (a API devolve da mais antiga).
        return summaries
            .map((summary) =>
                toGoal(summary, typeOf(groupsById.get(summary.groupId), sharedGroupIds)),
            )
            .reverse();
    }

    async getGoalDetails(goalId: string): Promise<GoalDetails | null> {
        const goal = await orNullIfNotFound(apiRequest<GoalResponse>(`/goals/${goalId}`));

        if (!goal) {
            return null;
        }

        const [thermometer, group, page, sharedGroupIds, user] = await Promise.all([
            apiRequest<ThermometerResponse>(`/goals/${goalId}/thermometer`),
            apiRequest<GroupResponse>(`/groups/${goal.groupId}`),
            apiRequest<ContributionPageResponse>(
                `/goals/${goalId}/contributions?page=0&size=${RECENT_RECORDS_LIMIT}`,
            ),
            sharedGroupsStore.list(),
            sessionStore.getUser(),
        ]);

        const type = typeOf(group, sharedGroupIds);

        return {
            id: goal.id,
            groupId: goal.groupId,
            type,
            name: goal.name,
            deadline: goal.deadline,
            deadlineLabel: toDeadlineLabel(goal.deadline),
            icon: goal.icon ?? null,
            category: goal.category ?? null,
            monthlyReminder: goal.monthlyReminder,
            milestonesEnabled: goal.milestonesEnabled,
            accumulatedAmount: money(thermometer.accumulated),
            targetAmount: money(thermometer.targetAmount),
            progress: toProgress(thermometer.status, thermometer.progressPercent),
            remainingAmount: Math.max(money(thermometer.remaining), 0),
            pace: toPace(thermometer.status),
            members: toMembers(group, thermometer, user?.id ?? null),
            records: page.content.map((item) => toRecord(item, type)),
        };
    }

    async listGoalRecords(goalId: string): Promise<GoalRecord[]> {
        const goal = await orNullIfNotFound(apiRequest<GoalResponse>(`/goals/${goalId}`));

        if (!goal) {
            return [];
        }

        const [group, sharedGroupIds] = await Promise.all([
            apiRequest<GroupResponse>(`/groups/${goal.groupId}`),
            sharedGroupsStore.list(),
        ]);
        const type = typeOf(group, sharedGroupIds);

        // Busca página por página até acabar (com um limite de segurança).
        const records: GoalRecord[] = [];

        for (let page = 0; page < MAX_PAGES; page++) {
            const data = await apiRequest<ContributionPageResponse>(
                `/goals/${goalId}/contributions?page=${page}&size=${MAX_PAGE_SIZE}`,
            );

            records.push(...data.content.map((item) => toRecord(item, type)));

            if (!data.hasNext) {
                break;
            }
        }

        return records;
    }

    async createGoal(input: CreateGoalInput): Promise<Goal> {
        // Toda Caixinha vive num grupo (L-06): primeiro o grupo, depois a meta.
        // Os IDs são gerados no app, então reenviar não duplica.
        const groupId = createId();

        await apiRequest<GroupResponse>('/groups', {
            method: 'POST',
            body: { id: groupId, name: input.name },
        });

        if (input.type === 'shared') {
            await sharedGroupsStore.add(groupId);
        }

        const deadline = toIsoDate(input.deadline);
        const created = await apiRequest<GoalResponse>(`/groups/${groupId}/goals`, {
            method: 'POST',
            body: {
                id: createId(),
                name: input.name,
                targetAmount: toCentsAmount(input.targetAmount),
                deadline,
                icon: input.icon,
                category: input.category,
                monthlyReminder: input.monthlyReminder,
                milestonesEnabled: input.milestonesEnabled,
            },
        });

        return {
            id: created.id,
            groupId,
            type: input.type,
            name: created.name,
            deadline: created.deadline,
            deadlineLabel: toDeadlineLabel(created.deadline),
            icon: created.icon ?? null,
            category: created.category ?? null,
            accumulatedAmount: 0,
            targetAmount: money(created.targetAmount),
            progress: toProgress('SEM_APORTES', 0),
        };
    }

    async updateGoal(goalId: string, input: UpdateGoalInput): Promise<Goal | null> {
        const current = await orNullIfNotFound(apiRequest<GoalResponse>(`/goals/${goalId}`));

        if (!current) {
            return null;
        }

        // O PUT substitui tudo: a tela manda todos os campos da meta.
        await apiRequest<GoalResponse>(`/goals/${goalId}`, {
            method: 'PUT',
            body: {
                name: input.name,
                targetAmount: toCentsAmount(input.targetAmount),
                deadline: toIsoDate(input.deadline),
                icon: input.icon,
                category: input.category,
                monthlyReminder: input.monthlyReminder,
                milestonesEnabled: input.milestonesEnabled,
            },
        });

        // Lê de novo para trazer o progresso recalculado pelo backend.
        const details = await this.getGoalDetails(goalId);

        if (!details) {
            return null;
        }

        const {
            remainingAmount,
            pace,
            members,
            records,
            monthlyReminder,
            milestonesEnabled,
            ...goal
        } = details;
        return goal;
    }

    async addContribution(goalId: string, input: AddContributionInput): Promise<void> {
        // A descrição não existe no contrato da API e não é enviada.
        await apiRequest<ContributionResponse>(`/goals/${goalId}/contributions`, {
            method: 'POST',
            body: {
                id: createId(),
                type: input.kind === 'withdrawal' ? 'RETIRADA' : 'ENTRADA',
                amount: toCentsAmount(input.amount),
            },
        });
    }

    async archiveGoal(goalId: string): Promise<void> {
        await apiRequest<GoalResponse>(`/goals/${goalId}/archive`, { method: 'POST' });
    }

    async deleteGoal(goalId: string): Promise<void> {
        await apiRequest<void>(`/goals/${goalId}`, { method: 'DELETE' });
    }

    async leaveGroup(groupId: string): Promise<void> {
        await apiRequest<void>(`/groups/${groupId}/members/me`, { method: 'DELETE' });
    }

    async removeMember(groupId: string, memberId: string): Promise<void> {
        // Continua compartilhada mesmo se sobrar só o Admin (ver sharedGroupsStore).
        await sharedGroupsStore.add(groupId);
        await apiRequest<void>(`/groups/${groupId}/members/${memberId}`, { method: 'DELETE' });
    }
}

export const goalRepository: GoalRepository = new ApiGoalRepository();
