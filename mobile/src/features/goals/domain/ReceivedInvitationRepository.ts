import type { InvitationPreview } from './InvitationPreview';

/**
 * Convites recebidos: consultar e aceitar pelo código.
 *
 * Fica separado do `InvitationRepository`, que gera os
 * convites do grupo.
 */
export interface ReceivedInvitationRepository {
    /** Prévia do convite: Caixinha, quem convidou e validade. */
    getPreview(code: string): Promise<InvitationPreview>;

    /** Entra no grupo do convite. */
    accept(code: string): Promise<void>;
}
