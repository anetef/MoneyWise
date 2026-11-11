import { ApiError } from '../../../../core/api/apiClient';

/** Mensagens amigáveis para os códigos de erro da API de Caixinhas. */
const MESSAGES: Record<string, string> = {
    NETWORK_ERROR: 'Sem conexão com o servidor. Tente de novo.',
    SESSION_EXPIRED: 'Sua sessão expirou. Entre novamente.',
    RESOURCE_NOT_FOUND: 'Essa Caixinha não existe mais ou você não participa dela.',
    GROUP_ADMIN_REQUIRED: 'Só o Admin da Caixinha pode fazer isso.',
    GROUP_LAST_MEMBER_CANNOT_LEAVE:
        'Você é o único membro. Para encerrar a Caixinha, use "Encerrar e Arquivar".',
    GOAL_ARCHIVED: 'Esta Caixinha está arquivada e não aceita mudanças.',
    GOAL_HAS_BALANCE:
        'A Caixinha ainda tem saldo. Retire o valor ou arquive a Caixinha em vez de excluir.',
    GOAL_INSUFFICIENT_BALANCE: 'Saldo insuficiente na Caixinha',
    INVALID_GOAL_DEADLINE: 'A data limite não pode estar no passado.',
    INVALID_GOAL_NAME: 'Informe um nome válido para a Caixinha.',
    INVALID_GOAL_TARGET: 'Informe um valor objetivo maior que zero.',
    INVALID_CONTRIBUTION_AMOUNT: 'Informe um valor maior que zero.',
};

/** Converte qualquer erro numa mensagem em português para a tela. */
export function goalErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof ApiError)) {
        return fallback;
    }

    return MESSAGES[error.code] ?? error.fields[0]?.message ?? fallback;
}

/** O erro é um código específico da API? */
export function isApiErrorCode(error: unknown, code: string): boolean {
    return error instanceof ApiError && error.code === code;
}
