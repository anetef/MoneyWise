import { useCallback, useState } from 'react';

import { goalRepository } from '../../data/ApiGoalRepository';
import type { GoalDetails } from '../../domain/Goal';
import { goalErrorMessage } from '../utils/goalErrorMessage';

/**
 * ViewModel dos detalhes de uma Caixinha.
 *
 * A tela chama `reload` ao receber foco.
 */
export function useGoalDetails(goalId: string) {
    const [goal, setGoal] = useState<GoalDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

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

    return {
        goal,
        isLoading,
        error,
        reload: loadGoal,
    };
}
