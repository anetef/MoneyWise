/**
 * Usuário autenticado.
 *
 * Tipo provisório: o contrato de `/users/me` depende
 * da aprovação dos endpoints da lacuna L-09.
 */
export type User = {
    id: string;
    name: string;
    email: string;
};
