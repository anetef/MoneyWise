import type { User } from './User';

/**
 * Acesso à sessão do usuário.
 *
 * A implementação atual é simulada. A versão real será
 * criada com a feature auth (MAU-01) e a aprovação do
 * endpoint `/users/me` (L-09).
 */
export interface AuthRepository {
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
