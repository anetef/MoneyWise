import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { transactionRepository } from '../../data/ApiTransactionRepository';
import type { MonthlySummary, Transaction } from '../../domain/Transaction';
import { currentMonth, transactionErrorMessage } from '../utils/format';

// Quantas transações aparecem no card "Últimas transações".
const LATEST_COUNT = 3;

/**
 * ViewModel do Dashboard.
 *
 * Busca o resumo do mês (GET /reports/monthly) e as últimas
 * transações (GET /transactions) sempre que a tela aparece,
 * para refletir o que acabou de ser criado ou editado.
 */
export function useDashboard() {
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [latest, setLatest] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setError('');

        try {
            const [monthSummary, page] = await Promise.all([
                transactionRepository.getMonthlySummary(currentMonth()),
                transactionRepository.list({ page: 0, size: LATEST_COUNT }),
            ]);

            setSummary(monthSummary);
            setLatest(page.items);
        } catch (e) {
            setError(transactionErrorMessage(e, 'Não foi possível carregar seu resumo.'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Recarrega ao entrar na tela e ao voltar de "Adicionar Transação".
    useFocusEffect(
        useCallback(() => {
            load();
        }, [load]),
    );

    // Quanto das entradas do mês já foi gasto (0 a 100), para o gráfico.
    const spentPercent =
        summary && summary.totalIncome > 0
            ? Math.min(100, Math.round((summary.totalExpense / summary.totalIncome) * 100))
            : summary && summary.totalExpense > 0
                ? 100
                : 0;

    // As 3 categorias com mais gasto, da maior para a menor.
    const topCategories = summary
        ? [...summary.expensesByCategory]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3)
        : [];

    return {
        summary,
        latest,
        isLoading,
        error,
        spentPercent,
        topCategories,
        reload: load,
    };
}
