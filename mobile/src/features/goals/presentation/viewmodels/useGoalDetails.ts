import { useCallback, useState } from 'react';

import { goalRepository } from '../../data/MockGoalRepository';
import type { GoalDetails } from '../../domain/Goal';

/**
 * ViewModel dos detalhes de uma Caixinha.
 *
 * A tela chama `reload` ao receber foco.
 */
export function useGoalDetails(goalId: string) {
    const [goal, setGoal] = useState<GoalDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadGoal = useCallback(async () => {
        try {
            setGoal(await goalRepository.getGoalDetails(goalId));
        } finally {
            setIsLoading(false);
        }
    }, [goalId]);

    return {
        goal,
        isLoading,
        reload: loadGoal,
    };
}
