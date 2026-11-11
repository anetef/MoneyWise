/**
 * Regras de senha usadas no cadastro e na troca de senha (SEC-09):
 * de 8 a 72 caracteres, como o backend exige.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

/** Força da senha de 0 a 4, para o medidor da tela. */
export function getPasswordStrength(password: string): number {
    if (!password) return 0;

    let strength = 0;

    if (password.length >= PASSWORD_MIN_LENGTH) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return strength;
}

/** Mensagem do primeiro problema da senha, ou `null` se estiver tudo certo. */
export function validateNewPassword(password: string, confirmPassword: string): string | null {
    if (password.length < PASSWORD_MIN_LENGTH) {
        return 'A senha deve ter pelo menos 8 caracteres.';
    }

    if (password.length > PASSWORD_MAX_LENGTH) {
        return 'A senha deve ter no máximo 72 caracteres.';
    }

    if (password !== confirmPassword) {
        return 'As senhas não coincidem.';
    }

    return null;
}
