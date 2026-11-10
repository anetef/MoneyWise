import { useRef, useState } from 'react';

import { ApiError } from '../../../../core/api/apiClient';
import { receivedInvitationRepository } from '../../data/ApiReceivedInvitationRepository';
import type { InvitationPreview } from '../../domain/InvitationPreview';

/** O backend gera códigos de 10 letras e números. */
export const INVITATION_CODE_LENGTH = 10;

const ERROR_MESSAGES: Record<string, string> = {
    GROUP_INVITATION_EXPIRED: 'Este convite expirou. Peça um novo para quem te convidou.',
    GROUP_INVITATION_NOT_PENDING: 'Este convite já foi usado. Peça um novo para quem te convidou.',
    NETWORK_ERROR: 'Sem conexão com o servidor. Tente de novo.',
};

function messageFor(error: unknown, fallback: string) {
    if (error instanceof ApiError) {
        if (error.status === 404) {
            return 'Convite não encontrado. Confira o código.';
        }

        if (ERROR_MESSAGES[error.code]) {
            return ERROR_MESSAGES[error.code];
        }
    }

    return fallback;
}

/**
 * Extrai o código do que a pessoa digitou ou colou.
 *
 * Aceita a mensagem inteira do WhatsApp ou um link: se houver
 * um trecho com exatamente 10 letras e números, usa esse trecho.
 * Senão, junta as letras e números (ignora espaços e traços).
 */
export function normalizeInvitationCode(text: string) {
    const upper = text.toUpperCase();
    const tokens = upper.split(/[^A-Z0-9]+/).filter(Boolean);
    const exact = tokens.filter((token) => token.length === INVITATION_CODE_LENGTH);

    if (exact.length > 0) {
        return exact[exact.length - 1];
    }

    return upper.replace(/[^A-Z0-9]/g, '').slice(0, INVITATION_CODE_LENGTH);
}

/**
 * ViewModel da tela Aceitar convite: código → prévia → aceite.
 */
export function useAcceptInvitation(initialCode = '') {
    const [code, setCode] = useState(() => normalizeInvitationCode(initialCode));
    const [preview, setPreview] = useState<InvitationPreview | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Trava imediata contra toque duplo (o estado só muda no próximo render).
    const busyRef = useRef(false);

    const canLookUp = code.length === INVITATION_CODE_LENGTH && !isLoadingPreview;

    function changeCode(text: string) {
        setCode(normalizeInvitationCode(text));
        setError(null);
    }

    async function lookUp() {
        if (!canLookUp || busyRef.current) {
            return;
        }

        busyRef.current = true;
        setIsLoadingPreview(true);
        setError(null);

        try {
            setPreview(await receivedInvitationRepository.getPreview(code));
        } catch (e) {
            setError(messageFor(e, 'Não foi possível abrir o convite. Tente novamente.'));
        } finally {
            busyRef.current = false;
            setIsLoadingPreview(false);
        }
    }

    async function accept() {
        if (!preview || isAccepted || busyRef.current) {
            return;
        }

        busyRef.current = true;
        setIsAccepting(true);
        setError(null);

        try {
            await receivedInvitationRepository.accept(preview.code);
            setIsAccepted(true);
        } catch (e) {
            setError(messageFor(e, 'Não foi possível aceitar o convite. Tente novamente.'));
        } finally {
            busyRef.current = false;
            setIsAccepting(false);
        }
    }

    return {
        code,
        preview,
        isLoadingPreview,
        isAccepting,
        isAccepted,
        canLookUp,
        error,
        changeCode,
        lookUp,
        accept,
    };
}
