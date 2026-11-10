import type { User } from './User';

/**
 * Acesso à sessão do usuário.
 *
 * A implementação atual é simulada. A versão real será
 * criada com a feature auth (MAU-01) e a aprovação do
 * endpoint `/users/me` (L-09).
 */
export interface AuthRepository {
        /** Faz login e guarda a sessão no aparelho. */
    login(email: string, password: string): Promise<User>;

    /**
     * Cria a conta com o e-mail ainda não confirmado.
     * A API não devolve tokens: o usuário precisa confirmar
     * o código enviado por e-mail antes de entrar.
     */
    register(name: string, email: string, password: string): Promise<void>;

    /** Confere o código de 6 dígitos e já guarda a sessão no aparelho. */
    verifyEmail(email: string, code: string): Promise<User>;

    /** Pede um novo código de confirmação (o anterior deixa de valer). */
    resendVerificationCode(email: string): Promise<void>;

    /** Usuário da sessão atual. */
    getCurrentUser(): Promise<User>;

    /**
     * Encerra a sessão no dispositivo.
     *
     * O logout completo do MAU-05 deverá chamar
     * `POST /auth/logout`, apagar os tokens do SecureStore,
     * limpar todos os dados do SQLite (RF-04) e tratar os
     * itens `pending` da fila de sincronização (decisão N5).
     */
    signOut(): Promise<void>;
}
