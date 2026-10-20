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
    /** Data limite (AAAA-MM-DD), ou null quando não há prazo. */
    deadline: string | null;
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

/**
 * Dados editáveis nas Configurações da Caixinha.
 *
 * Mesmos campos já definidos da criação; os demais
 * dependem de L-08.
 */
export type UpdateGoalInput = {
    name: string;
    targetAmount: number;
    deadline: Date | null;
};

/**
 * Tipo de movimento da Caixinha: entrada ou retirada (L-07).
 */
export type GoalRecordKind = 'deposit' | 'withdrawal';

export type GoalRecord = {
    id: string;
    kind: GoalRecordKind;
    description: string;
    /** Membro que registrou; usado nas Caixinhas compartilhadas. */
    memberName: string | null;
    /** Data e hora do registro (ISO 8601). */
    occurredAt: string;
    amount: number;
};

/**
 * Papéis definidos na arquitetura (ADMIN e MEMBER).
 */
export type GoalMemberRole = 'admin' | 'member';

/**
 * Participante da Caixinha.
 *
 * Exibe somente o que foi aportado na Caixinha e a
 * participação no total (RF-14), nunca o saldo pessoal
 * do membro (RN08).
 */
export type GoalMember = {
    id: string;
    name: string;
    role: GoalMemberRole;
    isCurrentUser: boolean;
    contributedAmount: number;
    sharePercent: number;
};

/**
 * Ritmo da Caixinha em relação ao planejado.
 *
 * Status devolvido pelo backend (RN01); o aplicativo
 * não calcula projeções.
 */
export type GoalPace = {
    title: string;
    message: string;
    tone: GoalProgressTone;
};

export type GoalDetails = Goal & {
    remainingAmount: number;
    pace: GoalPace | null;
    members: GoalMember[];
    records: GoalRecord[];
};
