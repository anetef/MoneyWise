import type { Invitation } from './Invitation';

/**
 * Acesso aos convites dos grupos.
 *
 * Implementação real: `ApiInvitationRepository`.
 */
export interface InvitationRepository {
    /** Gera um convite para o grupo (código de uso único, válido por 7 dias). */
    getActiveInvitation(groupId: string): Promise<Invitation>;
}
