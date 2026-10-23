import type { Invitation } from './Invitation';

/**
 * Acesso aos convites dos grupos.
 *
 * A implementação atual é simulada e não envia convites.
 */
export interface InvitationRepository {
    /** Convite ativo do grupo; gera um novo se não houver. */
    getActiveInvitation(groupId: string): Promise<Invitation>;
}
