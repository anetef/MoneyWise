import * as SecureStore from 'expo-secure-store';

import type { User } from '../../features/auth/domain/User';

const ACCESS_TOKEN_KEY = 'moneywise.accessToken';
const REFRESH_TOKEN_KEY = 'moneywise.refreshToken';
const USER_KEY = 'moneywise.user';

/**
 * Guarda a sessão do usuário (tokens + dados básicos)
 * de forma criptografada no aparelho, com o SecureStore (MOB-05).
 */
export const sessionStore = {
    getAccessToken() {
        return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    },

    getRefreshToken() {
        return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    },

    async saveTokens(accessToken: string, refreshToken: string) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    },

    async getUser(): Promise<User | null> {
        const json = await SecureStore.getItemAsync(USER_KEY);
        return json ? (JSON.parse(json) as User) : null;
    },

    async saveUser(user: User) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    },

    /** Apaga tudo: usado no logout e quando a sessão expira. */
    async clear() {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
    },
};
