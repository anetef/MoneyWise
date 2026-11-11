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
    /** Ícone escolhido (L-08), ou null para o visual padrão. */
    icon: string | null;
    /** Categoria escolhida (L-08), ou null. */
    category: string | null;
    accumulatedAmount: number;
    targetAmount: number;
    progress: GoalProgress;
};

/**
 * Campos extras da meta (L-08). Lembrete mensal e marcos ficam
 * guardados; os avisos no celular chegam com as notificações
 * (Release 2).
 */
export type GoalExtras = {
    icon: string | null;
    category: string | null;
    monthlyReminder: boolean;
    milestonesEnabled: boolean;
};

/**
 * Dados informados na criação de uma Caixinha.
 * "Meta sem prazo fixo" é a data limite vazia.
 */
export type CreateGoalInput = GoalExtras & {
    name: string;
    type: GoalType;
    targetAmount: number;
    deadline: Date | null;
};

/** Dados editáveis nas Configurações da Caixinha. */
export type UpdateGoalInput = GoalExtras & {
    name: string;
    targetAmount: number;
    deadline: Date | null;
};

/**
 * Dados de um movimento na Caixinha (MGO-06): aporte (entrada)
 * ou retirada (L-07).
 *
 * Provisório: o contrato de `POST /goals/{id}/contributions`
 * ainda não está no OpenAPI e poderá ser adaptado na
 * integração. A descrição existe apenas nos dados simulados;
 * `contributions` no ER não tem essa coluna.
 */
export type AddContributionInput = {
    amount: number;
    description?: string;
    /** Tipo do movimento; quando omitido, é uma entrada. */
    kind?: GoalRecordKind;
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
    monthlyReminder: boolean;
    milestonesEnabled: boolean;
    remainingAmount: number;
    pace: GoalPace | null;
    members: GoalMember[];
    records: GoalRecord[];
};
