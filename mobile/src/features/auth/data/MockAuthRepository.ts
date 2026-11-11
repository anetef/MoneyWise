import { ApiError } from '../../../core/api/apiClient';
import type { AuthRepository } from '../domain/AuthRepository';
import type { User } from '../domain/User';

// Dados simulados, coerentes com o usuário das Caixinhas
const mockUser: User = {
    id: 'user-alice',
    name: 'Alice Silva',
    email: 'alice.silva@email.com',
};

const MOCK_RESET_CODE = '123456';

/**
 * Repository simulado da sessão.
 */
export class MockAuthRepository implements AuthRepository {
    async login(): Promise<User> {
        return { ...mockUser };
    }

    async register(): Promise<void> {
        // Simulação: nenhuma conta é criada.
    }

    async verifyEmail(): Promise<User> {
        return { ...mockUser };
    }

    async resendVerificationCode(): Promise<void> {
        // Simulação: nenhum e-mail é enviado.
    }

    async requestPasswordReset(): Promise<void> {
        // Simulação: nenhum e-mail é enviado.
    }

    async verifyResetCode(_email: string, code: string): Promise<void> {
        // Simulação: só o código 123456 vale.
        if (code !== MOCK_RESET_CODE) {
            throw new ApiError(422, 'INVALID_RESET_CODE', 'Código inválido.');
        }
    }

    async resetPassword(email: string, code: string): Promise<void> {
        await this.verifyResetCode(email, code);
    }

    async getCurrentUser(): Promise<User> {
        return { ...mockUser };
    }

    async signOut(): Promise<void> {
        // Simulação: ainda não há tokens nem dados locais para limpar.
        // A revogação no backend e a limpeza do SecureStore e do SQLite
        // continuam pendentes do MAU-05 (dependem de MAU-01, MOB-05 e N5).
    }
}