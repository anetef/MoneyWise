import { useCallback, useMemo, useState } from 'react';

import { goalRepository } from '../../data/MockGoalRepository';
import type { Goal, GoalType } from '../../domain/Goal';

/**
 * ViewModel da lista de Caixinhas.
 *
 * A tela chama `reload` ao receber foco.
 */
export function useGoalsList() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [selectedType, setSelectedType] = useState<GoalType>('individual');
    const [isLoading, setIsLoading] = useState(true);

    const loadGoals = useCallback(async () => {
        try {
            setGoals(await goalRepository.listGoals());
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
        reload: loadGoals,
    };
}
