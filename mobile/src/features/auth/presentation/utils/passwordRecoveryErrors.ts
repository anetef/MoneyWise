import { ApiError } from '../../../../core/api/apiClient';

/** Código errado, vencido, já usado ou com 5 tentativas erradas (SEC-09). */
export const INVALID_RESET_CODE = 'INVALID_RESET_CODE';

/**
 * Mensagem para os erros da recuperação de senha.
 * A API não diz se o código está errado ou vencido, então a
 * mensagem cobre os dois casos.
 */
export function passwordRecoveryErrorMessage(e: unknown, fallback: string): string {
    if (e instanceof ApiError) {
        if (e.code === INVALID_RESET_CODE) {
            return 'Código incorreto ou vencido. Confira ou peça um novo código.';
        }

        if (e.code === 'NETWORK_ERROR') {
            return 'Sem conexão com o servidor. Tente de novo.';
        }

        if (e.status === 429) {
            return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
        }

        if (e.fields.length > 0) {
            // Erro de validação do backend (400): mostra a primeira mensagem.
            return e.fields[0].message;
        }
    }

    return fallback;
}
