import type { Invitation } from '../domain/Invitation';
import type { InvitationRepository } from '../domain/InvitationRepository';

/** Validade do convite (L-05). */
const INVITATION_DAYS = 7;

// Domínio do link apenas ilustrativo, conforme o Figma
const INVITE_BASE_URL = 'caixinhas.app/join';

const CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

// Códigos fixos para os grupos simulados
const mockCodes: Record<string, string> = {
    'group-paris': 'tK9xYp2m',
};

function generateCode(): string {
    return Array.from(
        { length: 8 },
        () => CODE_CHARACTERS[Math.floor(Math.random() * CODE_CHARACTERS.length)],
    ).join('');
}

/**
 * Repository simulado de convites.
 *
 * Gera um código por grupo e o mantém em memória durante
 * a sessão. Nenhum convite é enviado ao backend.
 */
export class MockInvitationRepository implements InvitationRepository {
    private invitations = new Map<string, Invitation>();

    async getActiveInvitation(groupId: string): Promise<Invitation> {
        const existing = this.invitations.get(groupId);

        if (existing && new Date(existing.expiresAt).getTime() > Date.now()) {
            return existing;
        }

        const code = mockCodes[groupId] ?? generateCode();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + INVITATION_DAYS);

        const invitation: Invitation = {
            groupId,
            code,
            link: `${INVITE_BASE_URL}/${code}`,
            expiresAt: expiresAt.toISOString(),
        };

        this.invitations.set(groupId, invitation);

        return invitation;
    }
}

export const invitationRepository: InvitationRepository = new MockInvitationRepository();
