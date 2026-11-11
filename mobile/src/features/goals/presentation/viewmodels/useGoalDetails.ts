import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { goalRepository } from '../../data/ApiGoalRepository';
import { watchGoalThermometer } from '../../data/goalRealtime';
import type { GoalDetails } from '../../domain/Goal';
import { goalErrorMessage } from '../utils/goalErrorMessage';

// Agrupa avisos seguidos (ex.: vários aportes juntos) numa leitura só.
const REALTIME_RELOAD_DELAY_MS = 400;

/**
 * ViewModel dos detalhes de uma Caixinha.
 *
 * A tela chama `reload` ao receber foco. Enquanto a tela está
 * aberta, o Termômetro chega em tempo real (RF-19): quando outro
 * membro registra uma entrada ou retirada, os detalhes recarregam
 * sozinhos (Termômetro, membros e últimos registros).
 */
export function useGoalDetails(goalId: string) {
    const [goal, setGoal] = useState<GoalDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadGoal = useCallback(async () => {
        setError('');

        try {
            setGoal(await goalRepository.getGoalDetails(goalId));
        } catch (e) {
            setError(goalErrorMessage(e, 'Não foi possível carregar a Caixinha.'));
        } finally {
            setIsLoading(false);
        }
    }, [goalId]);

    // Tempo real só com a tela em foco: ao sair, cancela a inscrição.
    useFocusEffect(
        useCallback(() => {
            const stopWatching = watchGoalThermometer(goalId, () => {
                if (reloadTimer.current) {
                    clearTimeout(reloadTimer.current);
                }

                reloadTimer.current = setTimeout(() => {
                    reloadTimer.current = null;
                    loadGoal();
                }, REALTIME_RELOAD_DELAY_MS);
            });

            return () => {
                stopWatching();

                if (reloadTimer.current) {
                    clearTimeout(reloadTimer.current);
                    reloadTimer.current = null;
                }
            };
        }, [goalId, loadGoal]),
    );

    // Garante que nenhum recarregamento rode depois de a tela fechar.
    useEffect(() => () => {
        if (reloadTimer.current) {
            clearTimeout(reloadTimer.current);
        }
    }, []);

    return {
        goal,
        isLoading,
        error,
        reload: loadGoal,
    };
}
