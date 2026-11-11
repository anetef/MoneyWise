import { useState } from 'react';

import { ApiError } from '../../../../core/api/apiClient';
import { authRepository } from '../../data/ApiAuthRepository';
import { getPasswordStrength, validateNewPassword } from '../utils/passwordRules';
import { INVALID_RESET_CODE, passwordRecoveryErrorMessage } from '../utils/passwordRecoveryErrors';

type Options = {
    email: string;
    code: string;
    /** Senha trocada: a tela volta para "Entrar na conta". */
    onPasswordChanged: () => void;
};

/**
 * ViewModel da tela Redefinir Senha (MAU-08).
 *
 * Usa as mesmas regras de senha do cadastro. A troca derruba
 * todas as sessões abertas e não faz login (SEC-09).
 */
export function useResetPassword({ email, code, onPasswordChanged }: Options) {
    const [password, setPasswordValue] = useState('');
    const [confirmPassword, setConfirmPasswordValue] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    // O código venceu entre a tela anterior e esta: é preciso pedir outro.
    const [codeExpired, setCodeExpired] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    function setPassword(text: string) {
        setPasswordValue(text);
        setError('');
    }

    function setConfirmPassword(text: string) {
        setConfirmPasswordValue(text);
        setError('');
    }

    async function submit() {
        if (isLoading || codeExpired) {
            return;
        }

        setError('');

        if (!password || !confirmPassword) {
            setError('Preencha a nova senha e a confirmação.');
            return;
        }

        const passwordError = validateNewPassword(password, confirmPassword);

        if (passwordError) {
            setError(passwordError);
            return;
        }

        setIsLoading(true);

        try {
            await authRepository.resetPassword(email, code, password);
            onPasswordChanged();
        } catch (e) {
            if (e instanceof ApiError && e.code === INVALID_RESET_CODE) {
                setCodeExpired(true);
                setError('Seu código venceu. Peça um novo código.');
            } else {
                setError(passwordRecoveryErrorMessage(e, 'Não foi possível trocar a senha. Tente novamente.'));
            }
        } finally {
            setIsLoading(false);
        }
    }

    return {
        password,
        setPassword,
        passwordStrength: getPasswordStrength(password),
        confirmPassword,
        setConfirmPassword,
        showPassword,
        toggleShowPassword: () => setShowPassword((current) => !current),
        showConfirmPassword,
        toggleShowConfirmPassword: () => setShowConfirmPassword((current) => !current),
        error,
        codeExpired,
        isLoading,
        submit,
    };
}
