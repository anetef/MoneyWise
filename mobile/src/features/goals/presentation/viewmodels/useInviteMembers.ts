import { useCallback, useEffect, useRef, useState } from 'react';

import { goalRepository } from '../../data/MockGoalRepository';
import { invitationRepository } from '../../data/MockInvitationRepository';
import type { Invitation } from '../../domain/Invitation';

/** Tempo de exibição do retorno "Copiado". */
const COPIED_FEEDBACK_MS = 2000;

/**
 * ViewModel da tela Convidar Membros.
 *
 * A tela chama `load` ao ser aberta.
 */
export function useInviteMembers(groupId: string) {
    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [goalName, setGoalName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const load = useCallback(async () => {
        try {
            const [activeInvitation, goals] = await Promise.all([
                invitationRepository.getActiveInvitation(groupId),
                goalRepository.listGoals(),
            ]);

            setInvitation(activeInvitation);
            setGoalName(goals.find((goal) => goal.groupId === groupId)?.name ?? null);
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

    useEffect(() => () => {
        if (copiedTimer.current) {
            clearTimeout(copiedTimer.current);
        }
    }, []);

    /**
     * Sinaliza a cópia do link.
     *
     * Simulado: copiar para a área de transferência exige
     * uma dependência ainda não aprovada (expo-clipboard).
     */
    function markAsCopied() {
        if (copiedTimer.current) {
            clearTimeout(copiedTimer.current);
        }

        setIsCopied(true);
        copiedTimer.current = setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
    }

    const expiresInDays = invitation
        ? Math.max(
            Math.ceil((new Date(invitation.expiresAt).getTime() - Date.now()) / 86_400_000),
            0,
        )
        : null;

    return {
        invitation,
        goalName,
        expiresInDays,
        isLoading,
        isCopied,
        load,
        markAsCopied,
    };
}
