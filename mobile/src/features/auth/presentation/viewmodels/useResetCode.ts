import { useEffect, useState } from 'react';

import { authRepository } from '../../data/ApiAuthRepository';
import { passwordRecoveryErrorMessage } from '../utils/passwordRecoveryErrors';

const CODE_LENGTH = 6;
// A API ignora um novo pedido feito em menos de 1 minuto.
const RESEND_COOLDOWN_SECONDS = 60;

type Options = {
    email: string;
    /** Código certo: a tela leva para "Redefinir senha". */
    onVerified: (code: string) => void;
};

/**
 * ViewModel da tela Verificar Código (MAU-08).
 *
 * Só confere o código: ele continua valendo e é enviado
 * de novo junto com a senha nova.
 */
export function useResetCode({ email, onVerified }: Options) {
    const [code, setCodeValue] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    // O código acabou de ser enviado: o reenvio começa bloqueado.
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

    // Contagem regressiva do "Reenviar código".
    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }

        const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    /** Aceita só números, no máximo 6. Mexer no código apaga o erro. */
    function setCode(text: string) {
        setCodeValue(text.replace(/\D/g, '').slice(0, CODE_LENGTH));
        setError('');
    }

    async function submit() {
        if (isLoading) {
            return;
        }

        setError('');
        setInfo('');

        if (code.length !== CODE_LENGTH) {
            setError('Digite o código de 6 dígitos.');
            return;
        }

        setIsLoading(true);

        try {
            await authRepository.verifyResetCode(email, code);
            onVerified(code);
        } catch (e) {
            setError(passwordRecoveryErrorMessage(e, 'Não foi possível conferir o código. Tente novamente.'));
        } finally {
            setIsLoading(false);
        }
    }

    async function resend() {
        if (isResending || cooldown > 0) {
            return;
        }

        setError('');
        setInfo('');
        setIsResending(true);

        try {
            await authRepository.requestPasswordReset(email);
            setCodeValue('');
            setInfo('Se o e-mail estiver cadastrado, enviamos um novo código.');
            setCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (e) {
            setError(passwordRecoveryErrorMessage(e, 'Não foi possível reenviar o código. Tente novamente.'));
        } finally {
            setIsResending(false);
        }
    }

    return {
        code,
        setCode,
        codeLength: CODE_LENGTH,
        error,
        info,
        isLoading,
        isResending,
        cooldown,
        canResend: cooldown <= 0 && !isResending,
        submit,
        resend,
    };
}
