/**
 * Convite para participar de uma Caixinha compartilhada.
 *
 * Decisão L-05: o app gera um código de convite, compartilhado
 * como link, WhatsApp ou QR Code. Quem recebe vê a Caixinha e
 * precisa aceitar. O convite expira em 7 dias. E-mail e
 * "Sugestões de Contatos" ficam fora do MVP.
 *
 * Tipo provisório: o contrato de `POST /groups/{id}/invitations`
 * ainda não está documentado no OpenAPI.
 */
export type Invitation = {
    groupId: string;
    code: string;
    link: string;
    /** Data de expiração (ISO 8601). */
    expiresAt: string;
};
