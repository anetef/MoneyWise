import type { CreateGoalInput, Goal } from '../domain/Goal';
import type { GoalRepository } from '../domain/GoalRepository';

import { mockGoals } from './mockGoals';

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

/**
 * Repository simulado das Caixinhas.
 *
 * Mantém os dados em memória durante a sessão:
 * Caixinhas criadas aparecem na lista até o
 * aplicativo ser reiniciado.
 */
export class MockGoalRepository implements GoalRepository {
    private goals: Goal[] = [...mockGoals];
    private nextId = 1;

    async listGoals(): Promise<Goal[]> {
        return [...this.goals];
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
}

export const goalRepository: GoalRepository = new MockGoalRepository();
