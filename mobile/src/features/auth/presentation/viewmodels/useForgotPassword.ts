import { useState } from 'react';

import { authRepository } from '../../data/ApiAuthRepository';
import { passwordRecoveryErrorMessage } from '../utils/passwordRecoveryErrors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Options = {
    /** E-mail já digitado no login, para não digitar de novo. */
    initialEmail?: string;
    /** Código pedido: a tela leva para "Verificar código". */
    onCodeSent: (email: string) => void;
};

/**
 * ViewModel da tela Recuperar Senha (MAU-07, MAU-08).
 *
 * A API responde igual quando o e-mail não tem conta (SEC-09),
 * então a tela sempre segue para o código.
 */
export function useForgotPassword({ initialEmail = '', onCodeSent }: Options) {
    const [email, setEmailValue] = useState(initialEmail);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /** Mexer no e-mail apaga o erro. */
    function setEmail(text: string) {
        setEmailValue(text);
        setError('');
    }

    async function submit() {
        if (isLoading) {
            return;
        }

        setError('');

        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail) {
            setError('Digite seu e-mail.');
            return;
        }

        if (!EMAIL_REGEX.test(cleanEmail)) {
            setError('Digite um e-mail válido.');
            return;
        }

        setIsLoading(true);

        try {
            await authRepository.requestPasswordReset(cleanEmail);
            onCodeSent(cleanEmail);
        } catch (e) {
            setError(passwordRecoveryErrorMessage(e, 'Não foi possível enviar o código. Tente novamente.'));
        } finally {
            setIsLoading(false);
        }
    }

    return {
        email,
        setEmail,
        error,
        isLoading,
        submit,
    };
}
