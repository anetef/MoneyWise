import * as SecureStore from 'expo-secure-store';

const KEY = 'moneywise.sharedGroups';

/**
 * Grupos criados como "Compartilhada" neste aparelho.
 *
 * Provisório: pela L-06, a API trata como individual todo grupo
 * com um membro só. Sem esta marca, uma Caixinha compartilhada
 * recém-criada (só com quem criou) apareceria como individual,
 * sem o botão de convidar. Quando o primeiro convidado entra,
 * a quantidade de membros já basta e a marca deixa de importar.
 *
 * Deve ser trocado por um campo da API (ex.: `memberCount` ou
 * `type` em GET /goals) quando o backend oferecer.
 */
export const sharedGroupsStore = {
    async list(): Promise<string[]> {
        try {
            const json = await SecureStore.getItemAsync(KEY);
            return json ? (JSON.parse(json) as string[]) : [];
        } catch {
            return [];
        }
    },

    async add(groupId: string): Promise<void> {
        const current = await this.list();

        if (!current.includes(groupId)) {
            await SecureStore.setItemAsync(KEY, JSON.stringify([...current, groupId]));
        }
    },
};
