import type { Goal } from '../domain/Goal';
import type { GoalRepository } from '../domain/GoalRepository';

import { mockGoals } from './mockGoals';

/**
 * Repository simulado das Caixinhas.
 *
 * Mantém os dados em memória durante a sessão.
 */
export class MockGoalRepository implements GoalRepository {
    private goals: Goal[] = [...mockGoals];

    async listGoals(): Promise<Goal[]> {
        return [...this.goals];
    }
}

export const goalRepository: GoalRepository = new MockGoalRepository();
