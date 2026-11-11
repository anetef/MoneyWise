import { useCallback, useState } from 'react';

import { ApiError } from '../../../../core/api/apiClient';
import { useMockAuth } from '../../../../core/navigation/MockAuthContext';
import { authRepository } from '../../data/ApiAuthRepository';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Options = {
    /** E-mail ainda não confirmado: a tela leva para a confirmação. */
    onEmailNotVerified: (email: string) => void;
};

/**
 * ViewModel da tela Entrar na Conta (MAU-03).
 *
 * O login bem-sucedido chama `signIn()`, e o RootNavigator troca
 * para a área logada. "Lembrar de mim" segue a L-02.
 */
export function useLogin({ onEmailNotVerified }: Options) {
    const { signIn } = useMockAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    // Aviso verde, ex.: depois de trocar a senha.
    const [notice, setNotice] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /** Volta da troca de senha: mostra o aviso e preenche o e-mail. */
    const showPasswordChanged = useCallback((changedEmail?: string) => {
        if (changedEmail) {
            setEmail(changedEmail);
        }

        setPassword('');
        setError('');
        setNotice('Senha alterada. Entre com a nova senha.');
    }, []);

    async function submit() {
        if (isLoading) {
            return;
        }

        setError('');
        setNotice('');

        if (!email.trim() || !password) {
            setError('Preencha seu e-mail e sua senha.');
            return;
        }

        if (!EMAIL_REGEX.test(email.trim())) {
            setError('Digite um e-mail válido.');
            return;
        }

        if (password.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres.');
            return;
        }

        setIsLoading(true);

        try {
            await authRepository.login(email.trim(), password, rememberMe);
            signIn();
        } catch (e) {
            if (e instanceof ApiError && e.code === 'INVALID_CREDENTIALS') {
                setError('E-mail ou senha incorretos.');
            } else if (e instanceof ApiError && e.code === 'EMAIL_NOT_VERIFIED') {
                // Leva para a confirmação; lá dá para pedir um novo código.
                onEmailNotVerified(email.trim().toLowerCase());
            } else if (e instanceof ApiError && e.code === 'NETWORK_ERROR') {
                setError('Sem conexão com o servidor. Tente de novo.');
            } else {
                setError('Não foi possível entrar. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return {
        email,
        setEmail,
        password,
        setPassword,
        showPassword,
        toggleShowPassword: () => setShowPassword((current) => !current),
        rememberMe,
        toggleRememberMe: () => setRememberMe((current) => !current),
        error,
        notice,
        showPasswordChanged,
        isLoading,
        submit,
    };
}
