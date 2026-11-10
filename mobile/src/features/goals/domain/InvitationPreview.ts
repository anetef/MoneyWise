/**
 * Prévia de um convite recebido, mostrada antes do aceite
 * (`GET /invitations/{code}`).
 *
 * Não traz valores da Caixinha: quem ainda não participa
 * não vê dados financeiros.
 */
export type InvitationPreview = {
    code: string;
    groupId: string;
    groupName: string;
    invitedByName: string;
    memberCount: number;
    /** Data de expiração (ISO 8601). */
    expiresAt: string;
    /** O usuário já participa do grupo. */
    alreadyMember: boolean;
};
