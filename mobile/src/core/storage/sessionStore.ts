import * as SecureStore from 'expo-secure-store';

import type { User } from '../../features/auth/domain/User';

const ACCESS_TOKEN_KEY = 'moneywise.accessToken';
const REFRESH_TOKEN_KEY = 'moneywise.refreshToken';
const USER_KEY = 'moneywise.user';

// "Lembrar de mim" desmarcado (L-02): a sessão fica só na memória
// e some quando o app fecha. Marcado (ou ao abrir o app), usa o SecureStore.
let persist = true;
const memory = new Map<string, string>();

function read(key: string): Promise<string | null> {
    return persist ? SecureStore.getItemAsync(key) : Promise.resolve(memory.get(key) ?? null);
}

async function write(key: string, value: string) {
    if (persist) {
        await SecureStore.setItemAsync(key, value);
    } else {
        memory.set(key, value);
    }
}

/**
 * Guarda a sessão do usuário (tokens + dados básicos)
 * de forma criptografada no aparelho, com o SecureStore (MOB-05).
 */
export const sessionStore = {
    /**
     * Começa uma sessão nova: apaga a anterior (inclusive a guardada
     * no aparelho) e define se a nova fica guardada (L-02).
     */
    async start(remember: boolean) {
        await sessionStore.clear();
        persist = remember;
    },

    getAccessToken() {
        return read(ACCESS_TOKEN_KEY);
    },

    getRefreshToken() {
        return read(REFRESH_TOKEN_KEY);
    },

    async saveTokens(accessToken: string, refreshToken: string) {
        await write(ACCESS_TOKEN_KEY, accessToken);
        await write(REFRESH_TOKEN_KEY, refreshToken);
    },

    async getUser(): Promise<User | null> {
        const json = await read(USER_KEY);
        return json ? (JSON.parse(json) as User) : null;
    },

    async saveUser(user: User) {
        await write(USER_KEY, JSON.stringify(user));
    },

    /** Apaga tudo: usado no logout e quando a sessão expira. */
    async clear() {
        memory.clear();
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
    },
};
