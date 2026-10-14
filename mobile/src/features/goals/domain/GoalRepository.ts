import type { CreateGoalInput, Goal, GoalDetails } from './Goal';

/**
 * Acesso aos dados das Caixinhas.
 *
 * A implementação atual é simulada. Quando os
 * endpoints forem aprovados (L-09), uma implementação
 * baseada na API substituirá a versão mockada.
 */
export interface GoalRepository {
    /** Caixinhas de que o usuário participa. */
    listGoals(): Promise<Goal[]>;

    /** Detalhes de uma Caixinha, ou null se não for encontrada. */
    getGoalDetails(goalId: string): Promise<GoalDetails | null>;

    /** Cria uma Caixinha; o usuário passa a ser o Admin (L-17). */
    createGoal(input: CreateGoalInput): Promise<Goal>;
}
