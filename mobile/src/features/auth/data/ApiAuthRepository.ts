import { apiRequest } from '../../../core/api/apiClient';
import { sessionStore } from '../../../core/storage/sessionStore';
import type { AuthRepository } from '../domain/AuthRepository';
import type { User } from '../domain/User';

// Formatos que a API devolve (iguais ao Swagger).
type UserResponse = {
    id: string;
    name: string;
    email: string;
    currency: string;
    emailVerified: boolean;
};

type LoginResponse = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    user: UserResponse;
};

function toUser(response: UserResponse): User {
    return {
        id: response.id,
        name: response.name,
        email: response.email,
    };
}

/**
 * Repository real: conversa com a API do MoneyWise.
 */
export class ApiAuthRepository implements AuthRepository {
    async login(email: string, password: string): Promise<User> {
        const data = await apiRequest<LoginResponse>('/auth/login', {
            method: 'POST',
            body: { email, password },
            auth: false,
        });

        const user = toUser(data.user);
        await sessionStore.saveTokens(data.accessToken, data.refreshToken);
        await sessionStore.saveUser(user);
        return user;
    }

    async getCurrentUser(): Promise<User> {
        const user = await sessionStore.getUser();

        if (!user) {
            throw new Error('Nenhum usuário logado.');
        }

        return user;
    }

    async signOut(): Promise<void> {
        const refreshToken = await sessionStore.getRefreshToken();

        try {
            if (refreshToken) {
                await apiRequest<void>('/auth/logout', {
                    method: 'POST',
                    body: { refreshToken },
                    auth: false,
                });
            }
        } catch {
            // Mesmo se a API falhar, o usuário sai do app.
        }

        await sessionStore.clear();
    }
}

export const authRepository: AuthRepository = new ApiAuthRepository();