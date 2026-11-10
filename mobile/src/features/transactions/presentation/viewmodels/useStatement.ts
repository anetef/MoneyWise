import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { transactionRepository } from '../../data/ApiTransactionRepository';
import type { Transaction } from '../../domain/Transaction';
import { currentMonth, formatDayHeader, transactionErrorMessage } from '../utils/format';

export type StatementFilter = 'all' | 'income' | 'expense';

export type StatementSection = {
    key: string;
    title: string;
    items: Transaction[];
};

// Quantas transações vêm por página da API.
const PAGE_SIZE = 30;

/** Agrupa transações (já ordenadas por data) em seções por dia. */
function groupByDay(items: Transaction[]): StatementSection[] {
    const sections: StatementSection[] = [];

    for (const item of items) {
        const last = sections[sections.length - 1];

        if (last && last.key === item.date) {
            last.items.push(item);
        } else {
            sections.push({ key: item.date, title: formatDayHeader(item.date), items: [item] });
        }
    }

    return sections;
}

/**
 * ViewModel do Extrato.
 *
 * Lista o histórico paginado (GET /transactions), mostra o saldo
 * do mês (GET /reports/monthly) e exclui transações (DELETE).
 */
export function useStatement() {
    const [items, setItems] = useState<Transaction[]>([]);
    const [balance, setBalance] = useState<number | null>(null);
    const [filter, setFilter] = useState<StatementFilter>('all');
    const [page, setPage] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState('');

    // Evita pedir a mesma página duas vezes com toques seguidos.
    const loadingMoreRef = useRef(false);

    /** Recarrega do zero (primeira página + saldo). */
    const load = useCallback(async () => {
        setError('');

        try {
            const [firstPage, summary] = await Promise.all([
                transactionRepository.list({ page: 0, size: PAGE_SIZE }),
                transactionRepository.getMonthlySummary(currentMonth()),
            ]);

            setItems(firstPage.items);
            setPage(0);
            setHasNext(firstPage.hasNext);
            setBalance(summary.balance);
        } catch (e) {
            setError(transactionErrorMessage(e, 'Não foi possível carregar o extrato.'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Recarrega ao entrar na tela e ao voltar da edição.
    useFocusEffect(
        useCallback(() => {
            load();
        }, [load]),
    );

    /** Busca a próxima página e junta no fim da lista. */
    async function loadMore() {
        if (!hasNext || loadingMoreRef.current) {
            return;
        }

        loadingMoreRef.current = true;
        setIsLoadingMore(true);
        setError('');

        try {
            const next = await transactionRepository.list({ page: page + 1, size: PAGE_SIZE });

            // Ignora itens repetidos, caso algo novo tenha entrado no meio.
            setItems((current) => {
                const ids = new Set(current.map((item) => item.id));
                return [...current, ...next.items.filter((item) => !ids.has(item.id))];
            });
            setPage(next.page);
            setHasNext(next.hasNext);
        } catch (e) {
            setError(transactionErrorMessage(e, 'Não foi possível carregar mais transações.'));
        } finally {
            loadingMoreRef.current = false;
            setIsLoadingMore(false);
        }
    }

    /** Exclui e recarrega (o saldo do mês também muda). Devolve a mensagem de erro, se houver. */
    async function remove(id: string): Promise<string | null> {
        try {
            await transactionRepository.remove(id);
            await load();
            return null;
        } catch (e) {
            return transactionErrorMessage(e, 'Não foi possível excluir a transação.');
        }
    }

    // A API não filtra por tipo, então o filtro Tudo/Entradas/Saídas é feito aqui.
    const sections = useMemo(() => {
        const visible = items.filter(
            (item) =>
                filter === 'all' ||
                (filter === 'income' ? item.type === 'INCOME' : item.type === 'EXPENSE'),
        );

        return groupByDay(visible);
    }, [items, filter]);

    return {
        sections,
        balance,
        filter,
        setFilter,
        hasNext,
        isLoading,
        isLoadingMore,
        error,
        loadMore,
        remove,
        reload: load,
    };
}
