import { sessionStore } from '../storage/sessionStore';

/** Endereço da API, vindo do arquivo .env.local (ex.: http://192.168.0.10:8080/api/v1). */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export type ApiFieldError = {
    field: string;
    message: string;
};

/**
 * Erro padronizado da API (mesmo formato do ErrorResponse do backend).
 * `code` é o que as telas usam para decidir o que fazer,
 * ex.: 'INVALID_CREDENTIALS', 'EMAIL_NOT_VERIFIED'.
 */
export class ApiError extends Error {
    status: number;
    code: string;
    fields: ApiFieldError[];

    constructor(status: number, code: string, message: string, fields: ApiFieldError[] = []) {
        super(message);
        this.status = status;
        this.code = code;
        this.fields = fields;
    }
}

type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    /** false para rotas públicas (login, cadastro...). Padrão: true. */
    auth?: boolean;
};

// Avisa o app quando a sessão morre de vez (refresh token inválido).
let onSessionExpired: (() => void) | null = null;

export function setOnSessionExpired(callback: (() => void) | null) {
    onSessionExpired = callback;
}

function send(path: string, options: RequestOptions, accessToken?: string | null) {
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    return fetch(`${BASE_URL}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
}

async function readResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
        return undefined as T;
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : undefined;

    if (!response.ok) {
        throw new ApiError(
            response.status,
            data?.code ?? 'UNKNOWN_ERROR',
            data?.message ?? 'Algo deu errado. Tente novamente.',
            data?.fields ?? [],
        );
    }

    return data as T;
}

// Se várias requisições tomarem 401 ao mesmo tempo, só um refresh é feito.
let refreshInProgress: Promise<boolean> | null = null;

/**
 * Renova o access token com o refresh token.
 * Exportado para o tempo real (WebSocket), que não passa pelo `apiRequest`.
 */
export function refreshTokens(): Promise<boolean> {
    if (!refreshInProgress) {
        refreshInProgress = (async () => {
            try {
                const refreshToken = await sessionStore.getRefreshToken();

                if (!refreshToken) {
                    return false;
                }

                const response = await send('/auth/refresh', {
                    method: 'POST',
                    body: { refreshToken },
                });

                if (!response.ok) {
                    return false;
                }

                const data = await response.json();
                await sessionStore.saveTokens(data.accessToken, data.refreshToken);
                return true;
            } catch {
                return false;
            }
        })().finally(() => {
            refreshInProgress = null;
        });
    }

    return refreshInProgress;
}

/**
 * Faz uma chamada à API.
 * - Coloca o token automaticamente nas rotas protegidas.
 * - Se o token venceu (401), renova e tenta de novo uma vez.
 * - Converte qualquer erro em ApiError.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    if (!BASE_URL) {
        throw new Error('EXPO_PUBLIC_API_URL não está definida no .env.local.');
    }

    const useAuth = options.auth ?? true;

    try {
        let token = useAuth ? await sessionStore.getAccessToken() : null;
        let response = await send(path, options, token);

        if (response.status === 401 && useAuth) {
            const refreshed = await refreshTokens();

            if (!refreshed) {
                await sessionStore.clear();
                onSessionExpired?.();
                throw new ApiError(401, 'SESSION_EXPIRED', 'Sua sessão expirou. Entre novamente.');
            }

            token = await sessionStore.getAccessToken();
            response = await send(path, options, token);
        }

        return await readResponse<T>(response);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // fetch falhou: servidor fora do ar, IP errado, sem internet...
        throw new ApiError(0, 'NETWORK_ERROR', 'Não foi possível conectar ao servidor.');
    }
}