import { useCallback, useMemo, useState } from 'react';

import { goalRepository } from '../../data/MockGoalRepository';
import type { Goal, GoalRecord, GoalRecordKind } from '../../domain/Goal';
import { dayKey, formatDayHeader } from '../utils/formatDate';

export type StatementFilter = 'all' | GoalRecordKind;

export type StatementSection = {
    key: string;
    title: string;
    records: GoalRecord[];
};

/** Agrupa registros já ordenados por dia, mantendo a ordem. */
function groupByDay(records: GoalRecord[]): StatementSection[] {
    const sections: StatementSection[] = [];

    for (const record of records) {
        const key = dayKey(record.occurredAt);
        const last = sections[sections.length - 1];

        if (last && last.key === key) {
            last.records.push(record);
        } else {
            sections.push({
                key,
                title: formatDayHeader(record.occurredAt),
                records: [record],
            });
        }
    }

    return sections;
}

/**
 * ViewModel do extrato da Caixinha.
 *
 * A tela chama `reload` ao receber foco.
 */
export function useGoalStatement(goalId: string) {
    const [goal, setGoal] = useState<Goal | null>(null);
    const [records, setRecords] = useState<GoalRecord[]>([]);
    const [filter, setFilter] = useState<StatementFilter>('all');
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const [details, allRecords] = await Promise.all([
                goalRepository.getGoalDetails(goalId),
                goalRepository.listGoalRecords(goalId),
            ]);

            setGoal(details);
            setRecords(allRecords);
        } finally {
            setIsLoading(false);
        }
    }, [goalId]);

    const sections = useMemo(
        () => groupByDay(
            filter === 'all'
                ? records
                : records.filter((record) => record.kind === filter),
        ),
        [records, filter],
    );

    return {
        goal,
        sections,
        filter,
        setFilter,
        isLoading,
        reload: load,
    };
}
