import { apiRequest } from '../../../core/api/apiClient';
import type { InvitationPreview } from '../domain/InvitationPreview';
import type { ReceivedInvitationRepository } from '../domain/ReceivedInvitationRepository';

/**
 * Repository real dos convites recebidos.
 *
 * A prévia da API já vem no formato de `InvitationPreview`.
 */
export class ApiReceivedInvitationRepository implements ReceivedInvitationRepository {
    async getPreview(code: string): Promise<InvitationPreview> {
        return apiRequest<InvitationPreview>(`/invitations/${encodeURIComponent(code)}`);
    }

    async accept(code: string): Promise<void> {
        // A API devolve o grupo; a tela só precisa saber que deu certo.
        await apiRequest<unknown>(`/invitations/${encodeURIComponent(code)}/accept`, {
            method: 'POST',
        });
    }
}

export const receivedInvitationRepository: ReceivedInvitationRepository =
    new ApiReceivedInvitationRepository();
