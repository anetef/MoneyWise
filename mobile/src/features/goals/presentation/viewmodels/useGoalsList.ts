import { useCallback, useMemo, useState } from 'react';

import { goalRepository } from '../../data/ApiGoalRepository';
import type { Goal, GoalType } from '../../domain/Goal';
import { goalErrorMessage } from '../utils/goalErrorMessage';

/**
 * ViewModel da lista de Caixinhas.
 *
 * A tela chama `reload` ao receber foco.
 */
export function useGoalsList() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [selectedType, setSelectedType] = useState<GoalType>('individual');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const loadGoals = useCallback(async () => {
        setError('');

        try {
            setGoals(await goalRepository.listGoals());
        } catch (e) {
            setError(goalErrorMessage(e, 'Não foi possível carregar suas Caixinhas.'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const visibleGoals = useMemo(
        () => goals.filter((goal) => goal.type === selectedType),
        [goals, selectedType],
    );

    return {
        visibleGoals,
        selectedType,
        setSelectedType,
        isLoading,
        error,
        reload: loadGoals,
    };
}
