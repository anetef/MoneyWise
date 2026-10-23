import { useCallback, useEffect, useMemo, useState } from 'react';

import { goalRepository } from '../../data/MockGoalRepository';
import type { GoalDetails, GoalRecord, GoalRecordKind } from '../../domain/Goal';
import { dayKey, formatDayHeader } from '../utils/formatDate';

export type StatementFilter = 'all' | GoalRecordKind;

/** Período do extrato: todo o histórico ou os últimos dias, contando hoje. */
export type StatementPeriod = 'all' | 'last7' | 'last30';

export type StatementSection = {
    key: string;
    title: string;
    records: GoalRecord[];
};

const periodDays: Record<Exclude<StatementPeriod, 'all'>, number> = {
    last7: 7,
    last30: 30,
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
 * Limites do período no horário local do aparelho: da meia-noite
 * do primeiro dia (hoje e os dias anteriores) até o fim de hoje.
 */
function periodRange(period: StatementPeriod, now: Date): [number, number] | null {
    if (period === 'all') {
        return null;
    }

    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    return [
        new Date(year, month, day - (periodDays[period] - 1)).getTime(),
        new Date(year, month, day + 1).getTime(),
    ];
}

/**
 * Nomes dos membros que podem ser filtrados.
 *
 * Provisório: os registros só trazem `memberName`, então a
 * correspondência é feita pelo nome, apenas para a demonstração.
 * Nomes repetidos ficam de fora, para não misturar pessoas.
 */
function filterableMemberNames(goal: GoalDetails | null): string[] {
    if (!goal || goal.type !== 'shared') {
        return [];
    }

    const names = goal.members.map((member) => member.name);

    return names.filter((name) => names.indexOf(name) === names.lastIndexOf(name));
}

/**
 * ViewModel do extrato da Caixinha.
 *
 * Filtra os registros já carregados por tipo (abas), período e,
 * nas compartilhadas, por membro. A tela chama `reload` ao
 * receber foco.
 */
export function useGoalStatement(goalId: string) {
    const [goal, setGoal] = useState<GoalDetails | null>(null);
    const [records, setRecords] = useState<GoalRecord[]>([]);
    const [filter, setFilter] = useState<StatementFilter>('all');
    const [period, setPeriod] = useState<StatementPeriod>('all');
    const [memberName, setMemberName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Outra Caixinha começa com os filtros padrão.
    useEffect(() => {
        setFilter('all');
        setPeriod('all');
        setMemberName(null);
    }, [goalId]);

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

    const memberOptions = useMemo(() => filterableMemberNames(goal), [goal]);

    // Filtro de membro só vale se o nome ainda estiver entre as opções.
    const activeMemberName = memberName && memberOptions.includes(memberName)
        ? memberName
        : null;

    const sections = useMemo(() => {
        const range = periodRange(period, new Date());

        return groupByDay(records.filter((record) => {
            if (filter !== 'all' && record.kind !== filter) {
                return false;
            }

            if (range) {
                const time = new Date(record.occurredAt).getTime();

                if (!(time >= range[0] && time < range[1])) {
                    return false;
                }
            }

            // Registros sem autor só aparecem em "Todos".
            return !activeMemberName || record.memberName === activeMemberName;
        }));
    }, [records, filter, period, activeMemberName]);

    const activeFilterCount = (period !== 'all' ? 1 : 0) + (activeMemberName ? 1 : 0);

    /** Volta período e membro ao padrão; a aba escolhida continua. */
    const clearFilters = useCallback(() => {
        setPeriod('all');
        setMemberName(null);
    }, []);

    return {
        goal,
        sections,
        filter,
        setFilter,
        period,
        setPeriod,
        memberName: activeMemberName,
        setMemberName,
        memberOptions,
        activeFilterCount,
        clearFilters,
        isLoading,
        reload: load,
    };
}
