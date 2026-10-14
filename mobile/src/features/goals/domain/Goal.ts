/**
 * Tipos de domínio das Caixinhas.
 *
 * Provisórios: o contrato da API ainda não foi
 * documentado (L-09). Pela decisão L-06, toda Caixinha
 * pertence a um grupo; a individual é um grupo com
 * um único membro.
 */
export type GoalType = 'individual' | 'shared';

/**
 * Tom visual do progresso.
 *
 * O status é calculado pelo backend (RN01);
 * o aplicativo apenas exibe o que recebe.
 */
export type GoalProgressTone = 'positive' | 'neutral' | 'attention';

export type GoalProgress = {
    percent: number;
    label: string;
    tone: GoalProgressTone;
};

export type Goal = {
    id: string;
    groupId: string;
    type: GoalType;
    name: string;
    deadlineLabel: string | null;
    accumulatedAmount: number;
    targetAmount: number;
    progress: GoalProgress;
};

/**
 * Dados informados na criação de uma Caixinha.
 *
 * Contém apenas os campos já definidos; ícone, categoria,
 * meta sem prazo, lembrete e marcos dependem de L-08.
 */
export type CreateGoalInput = {
    name: string;
    type: GoalType;
    targetAmount: number;
    deadline: Date | null;
};
