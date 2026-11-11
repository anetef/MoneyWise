import { useState } from 'react';

import { ApiError } from '../../../../core/api/apiClient';
import { authRepository } from '../../data/ApiAuthRepository';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Força da senha de 0 a 4, para o medidor da tela. */
function getPasswordStrength(password: string): number {
    if (!password) return 0;

    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return strength;
}

type Options = {
    /** Conta criada: a tela leva para a confirmação do e-mail. */
    onRegistered: (email: string) => void;
};

/**
 * ViewModel da tela Criar Nova Conta (MAU-03, MAU-10).
 *
 * A API não devolve tokens no cadastro: a sessão só começa
 * depois de confirmar o código enviado por e-mail.
 */
export function useRegister({ onRegistered }: Options) {
    const [name, setName] = useState('');
    const [email, setEmailValue] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState('');
    // Erro do próprio campo de e-mail (ex.: e-mail já cadastrado).
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /** Mexer no e-mail apaga o erro do campo. */
    function setEmail(text: string) {
        setEmailValue(text);
        setEmailError('');
    }

    async function submit() {
        if (isLoading) {
            return;
        }

        setError('');
        setEmailError('');

        if (
            !name.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }

        if (name.trim().length < 3) {
            setError('Digite seu nome completo.');
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

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (!acceptedTerms) {
            setError(
                'Você precisa aceitar os Termos de Uso e a Política de Privacidade.'
            );
            return;
        }

        if (password.length > 72) {
            setError('A senha deve ter no máximo 72 caracteres.');
            return;
        }

        setIsLoading(true);

        const cleanEmail = email.trim().toLowerCase();

        try {
            await authRepository.register(name.trim(), cleanEmail, password);

            // Conta criada: agora o usuário confirma o código enviado por e-mail.
            onRegistered(cleanEmail);
        } catch (e) {
            if (e instanceof ApiError && e.code === 'EMAIL_ALREADY_IN_USE') {
                setEmailError('Este e-mail já está cadastrado. Tente entrar na sua conta.');
            } else if (e instanceof ApiError && e.code === 'NETWORK_ERROR') {
                setError('Sem conexão com o servidor. Tente de novo.');
            } else if (e instanceof ApiError && e.fields.length > 0) {
                // Erro de validação do backend (400): mostra a primeira mensagem.
                setError(e.fields[0].message);
            } else {
                setError('Não foi possível criar sua conta. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return {
        name,
        setName,
        email,
        setEmail,
        emailError,
        password,
        setPassword,
        passwordStrength: getPasswordStrength(password),
        confirmPassword,
        setConfirmPassword,
        showPassword,
        toggleShowPassword: () => setShowPassword((current) => !current),
        showConfirmPassword,
        toggleShowConfirmPassword: () => setShowConfirmPassword((current) => !current),
        acceptedTerms,
        toggleAcceptedTerms: () => setAcceptedTerms((current) => !current),
        error,
        isLoading,
        submit,
    };
}
