import type {
    CreateGoalInput,
    Goal,
    GoalDetails,
    GoalRecord,
    UpdateGoalInput,
} from './Goal';

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

    /**
     * Detalhes de uma Caixinha com os registros mais recentes,
     * ou null se não for encontrada.
     */
    getGoalDetails(goalId: string): Promise<GoalDetails | null>;

    /**
     * Todos os registros da Caixinha (extrato), do mais recente
     * para o mais antigo. Contém apenas movimentos da Caixinha,
     * nunca transações pessoais (RN02).
     */
    listGoalRecords(goalId: string): Promise<GoalRecord[]>;

    /** Cria uma Caixinha; o usuário passa a ser o Admin (L-17). */
    createGoal(input: CreateGoalInput): Promise<Goal>;

    /**
     * Atualiza nome, valor objetivo e data limite.
     * Devolve null se a Caixinha não for encontrada.
     */
    updateGoal(goalId: string, input: UpdateGoalInput): Promise<Goal | null>;
}
