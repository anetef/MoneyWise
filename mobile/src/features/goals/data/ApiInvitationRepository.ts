import { apiRequest } from '../../../core/api/apiClient';
import type { Invitation } from '../domain/Invitation';
import type { InvitationRepository } from '../domain/InvitationRepository';

type InvitationResponse = {
    id: string;
    code: string;
    groupId: string;
    expiresAt: string;
};

/**
 * Repository real dos convites do grupo (L-05).
 *
 * `POST /groups/{id}/invitations` gera um código de uso único,
 * válido por 7 dias. Só o Admin convida (L-10).
 *
 * Como o código vale para uma pessoa só, um novo é gerado cada
 * vez que a tela de convite abre: assim nunca se compartilha
 * um código que outra pessoa já usou.
 */
export class ApiInvitationRepository implements InvitationRepository {
    async getActiveInvitation(groupId: string): Promise<Invitation> {
        const data = await apiRequest<InvitationResponse>(`/groups/${groupId}/invitations`, {
            method: 'POST',
        });

        return {
            groupId: data.groupId,
            code: data.code,
            // Ainda não há link de convite definido (L-05): o código é o que vale.
            link: data.code,
            expiresAt: data.expiresAt,
        };
    }
}

export const invitationRepository: InvitationRepository = new ApiInvitationRepository();
