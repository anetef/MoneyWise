import type { AuthRepository } from '../domain/AuthRepository';
import type { User } from '../domain/User';

// Dados simulados, coerentes com o usuário das Caixinhas
const mockUser: User = {
    id: 'user-alice',
    name: 'Alice Silva',
    email: 'alice.silva@email.com',
};

/**
 * Repository simulado da sessão.
 */
export class MockAuthRepository implements AuthRepository {
    async getCurrentUser(): Promise<User> {
        return { ...mockUser };
    }

    async signOut(): Promise<void> {
        // Simulação: ainda não há tokens nem dados locais para limpar.
        // A revogação no backend e a limpeza do SecureStore e do SQLite
        // continuam pendentes do MAU-05 (dependem de MAU-01, MOB-05 e N5).
    }
}

export const authRepository: AuthRepository = new MockAuthRepository();
