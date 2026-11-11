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

// Moeda padrão da conta (RN09). Ainda não há seletor de moeda no cadastro.
const DEFAULT_CURRENCY = 'BRL';

/**
 * Guarda tokens e usuário (usado no login e na confirmação do e-mail).
 * `remember` falso: a sessão fica só na memória e some ao fechar o app (L-02).
 */
async function saveSession(data: LoginResponse, remember: boolean): Promise<User> {
    const user = toUser(data.user);
    await sessionStore.start(remember);
    await sessionStore.saveTokens(data.accessToken, data.refreshToken);
    await sessionStore.saveUser(user);
    return user;
}

/**
 * Repository real: conversa com a API do MoneyWise.
 */
export class ApiAuthRepository implements AuthRepository {
    async login(email: string, password: string, remember: boolean): Promise<User> {
        const data = await apiRequest<LoginResponse>('/auth/login', {
            method: 'POST',
            body: { email, password },
            auth: false,
        });

        return saveSession(data, remember);
    }

    async register(name: string, email: string, password: string): Promise<void> {
        // A API devolve o usuário criado, mas sem tokens:
        // a sessão só começa depois de confirmar o e-mail.
        await apiRequest<UserResponse>('/auth/register', {
            method: 'POST',
            body: { name, email, password, currency: DEFAULT_CURRENCY },
            auth: false,
        });
    }

    async verifyEmail(email: string, code: string): Promise<User> {
        // Se o código estiver certo, a API responde igual ao login.
        const data = await apiRequest<LoginResponse>('/auth/verify-email', {
            method: 'POST',
            body: { email, code },
            auth: false,
        });

        // O cadastro não tem "Lembrar de mim": a sessão fica guardada.
        return saveSession(data, true);
    }

    async resendVerificationCode(email: string): Promise<void> {
        await apiRequest<void>('/auth/resend-verification', {
            method: 'POST',
            body: { email },
            auth: false,
        });
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