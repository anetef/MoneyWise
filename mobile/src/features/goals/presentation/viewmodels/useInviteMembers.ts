import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Share } from 'react-native';

import { goalRepository } from '../../data/MockGoalRepository';
import { invitationRepository } from '../../data/MockInvitationRepository';
import type { Invitation } from '../../domain/Invitation';

/** Tempo de exibição dos retornos de cópia e compartilhamento. */
const FEEDBACK_MS = 4000;

export type InviteFeedback = {
    tone: 'success' | 'error' | 'info';
    message: string;
};

/**
 * Mensagem compartilhada com o código de convite.
 *
 * Não contém link: o formato do link ainda não foi definido
 * (L-05). Deixa claro que o convite é simulado nesta versão.
 */
function buildInviteMessage(
    goalName: string | null,
    code: string,
    expiresInDays: number | null,
): string {
    const goal = goalName ? `a caixinha "${goalName}"` : 'uma caixinha';
    const validity = expiresInDays === null
        ? ''
        : ` (válido por ${expiresInDays} ${expiresInDays === 1 ? 'dia' : 'dias'})`;

    return [
        `Convite para ${goal} no MoneyWise.`,
        `Código de convite: ${code}${validity}.`,
        'Convite simulado: nesta versão de demonstração, o código ainda não pode ser usado para entrar na caixinha.',
    ].join('\n');
}

/**
 * ViewModel da tela Convidar Membros.
 *
 * Copia o código de convite e abre o compartilhamento nativo.
 * Nenhum convite é enviado ou validado: o mecanismo real
 * depende da integração (GRP-05).
 */
export function useInviteMembers(groupId: string) {
    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [goalName, setGoalName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    const [feedback, setFeedback] = useState<InviteFeedback | null>(null);

    const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(true);
    // Evitam operações repetidas com toques seguidos.
    const copyingRef = useRef(false);
    const sharingRef = useRef(false);

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

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;

            if (feedbackTimer.current) {
                clearTimeout(feedbackTimer.current);
            }
        };
    }, []);

    const expiresInDays = invitation
        ? Math.max(
            Math.ceil((new Date(invitation.expiresAt).getTime() - Date.now()) / 86_400_000),
            0,
        )
        : null;

    /** Mostra um retorno por alguns segundos (ou o remove, com null). */
    function showFeedback(next: InviteFeedback | null, copied = false) {
        if (!mountedRef.current) {
            return;
        }

        if (feedbackTimer.current) {
            clearTimeout(feedbackTimer.current);
            feedbackTimer.current = null;
        }

        setFeedback(next);
        setIsCopied(copied);

        if (next) {
            feedbackTimer.current = setTimeout(() => {
                setFeedback(null);
                setIsCopied(false);
            }, FEEDBACK_MS);
        }
    }

    /** Copia somente o código; confirma apenas se a cópia funcionou. */
    async function copyCode() {
        if (!invitation || copyingRef.current) {
            return;
        }

        copyingRef.current = true;

        try {
            const copied = await Clipboard.setStringAsync(invitation.code);

            if (copied) {
                showFeedback({ tone: 'success', message: 'Código copiado.' }, true);
                return;
            }

            throw new Error('Clipboard indisponível');
        } catch {
            showFeedback({
                tone: 'error',
                message: 'Não foi possível copiar. Selecione o código e copie manualmente.',
            });
        } finally {
            copyingRef.current = false;
        }
    }

    /**
     * Abre o compartilhamento nativo com a mensagem do convite.
     *
     * Abrir o compartilhamento não significa que o convite foi
     * enviado. No Android a API não distingue o cancelamento,
     * então nenhuma confirmação é exibida.
     */
    async function shareInvitation() {
        if (!invitation || sharingRef.current) {
            return;
        }

        sharingRef.current = true;
        showFeedback(null);

        try {
            const result = await Share.share({
                message: buildInviteMessage(goalName, invitation.code, expiresInDays),
            });

            // iOS informa o cancelamento; no Web, cancelar rejeita a Promise.
            const completed = Platform.OS === 'web'
                || (Platform.OS === 'ios' && result?.action === Share.sharedAction);

            if (completed) {
                showFeedback({
                    tone: 'info',
                    message: 'Mensagem compartilhada pelo app escolhido. O convite ainda é simulado.',
                });
            }
        } catch (error) {
            const name = error instanceof Error ? error.name : '';

            // Cancelado pela pessoa (Web): sem mensagem.
            if (name === 'AbortError') {
                return;
            }

            showFeedback({
                tone: 'info',
                message: Platform.OS === 'web'
                    ? 'Seu navegador não permite compartilhar. Copie o código de convite.'
                    : 'Não foi possível abrir o compartilhamento. Copie o código de convite.',
            });
        } finally {
            sharingRef.current = false;
        }
    }

    return {
        invitation,
        goalName,
        expiresInDays,
        isLoading,
        isCopied,
        feedback,
        load,
        copyCode,
        shareInvitation,
    };
}
