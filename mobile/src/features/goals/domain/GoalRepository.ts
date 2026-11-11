import type {
    AddContributionInput,
    CreateGoalInput,
    Goal,
    GoalDetails,
    GoalRecord,
    UpdateGoalInput,
} from './Goal';

/**
 * Acesso aos dados das Caixinhas.
 *
 * Implementação real: `ApiGoalRepository` (API do MoneyWise).
 * A versão simulada (`MockGoalRepository`) fica para testes.
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

    /**
     * Registra um movimento do usuário na Caixinha: entrada
     * (padrão) ou retirada (L-07).
     *
     * Provisório: será adaptado ao contrato real da API
     * (`POST /goals/{id}/contributions`). Saldo, progresso e
     * contribuições atualizados vêm do backend e são lidos
     * depois com getGoalDetails. Falha se a Caixinha não existir
     * ou se a retirada for maior que o saldo acumulado.
     */
    addContribution(goalId: string, input: AddContributionInput): Promise<void>;

    /**
     * Arquiva a Caixinha: sai da lista, mas mantém histórico
     * e acumulado. Só o Admin (L-17).
     */
    archiveGoal(goalId: string): Promise<void>;

    /**
     * Exclui a Caixinha e o histórico. Só o Admin (L-17) e só
     * sem valor acumulado (falha com GOAL_HAS_BALANCE).
     */
    deleteGoal(goalId: string): Promise<void>;

    /**
     * O usuário sai do grupo da Caixinha (L-09). Se for o Admin,
     * o membro mais antigo vira Admin (L-10).
     */
    leaveGroup(groupId: string): Promise<void>;

    /**
     * Remove um membro do grupo da Caixinha. Só o Admin (RN04, L-10).
     * Os aportes que ele já fez continuam no total da Caixinha.
     */
    removeMember(groupId: string, memberId: string): Promise<void>;
}
