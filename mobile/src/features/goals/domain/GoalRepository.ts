import type { Goal } from './Goal';

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
}
