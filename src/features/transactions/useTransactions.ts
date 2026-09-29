import { useCallback, useEffect, useMemo, useState } from 'react';

import { AppError } from '@/core/utils/errors';
import { useCurrentUser } from '@/features/auth/AuthContext';
import { getCategory } from './categories';
import { transactionRepository } from './transactionRepository';
import type { Transaction, TransactionInput } from './types';

export type CategorySlice = { categoryId: string; label: string; color: string; total: number };

export type TransactionsSummary = {
  balance: number;
  monthIncome: number;
  monthExpense: number;
  /** Gastos do mês por categoria, do maior para o menor. */
  expenseByCategory: CategorySlice[];
};

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** RN-03: transações de meses anteriores (fechados) não podem ser editadas. */
export function isLocked(tx: Pick<Transaction, 'date'>, now = new Date()): boolean {
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return tx.date < startOfMonth;
}

export function summarize(items: Transaction[], now = new Date()): TransactionsSummary {
  let balance = 0;
  let monthIncome = 0;
  let monthExpense = 0;
  const byCat = new Map<string, number>();

  for (const tx of items) {
    const signed = tx.type === 'income' ? tx.amount : -tx.amount;
    balance += signed;
    if (!isSameMonth(tx.date, now)) continue;
    if (tx.type === 'income') monthIncome += tx.amount;
    else {
      monthExpense += tx.amount;
      byCat.set(tx.categoryId, (byCat.get(tx.categoryId) ?? 0) + tx.amount);
    }
  }

  const expenseByCategory = [...byCat.entries()]
    .map(([categoryId, total]) => {
      const c = getCategory(categoryId);
      return { categoryId, label: c.label, color: c.color, total };
    })
    .sort((a, b) => b.total - a.total);

  return { balance, monthIncome, monthExpense, expenseByCategory };
}

function validate(input: Partial<TransactionInput>) {
  if (input.amount !== undefined && !(input.amount > 0)) {
    throw new AppError('Informe um valor maior que zero.');
  }
  if (input.categoryId !== undefined && !input.categoryId) {
    throw new AppError('Escolha uma categoria.');
  }
}

/**
 * Camada de LÓGICA (o "BLoC" da arquitetura, feito com hooks).
 * Liga a tela ao repositório: carrega em tempo real, valida e calcula totais.
 */
export function useTransactions() {
  const user = useCurrentUser();
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    setLoading(true);
    return transactionRepository.subscribe(
      user.id,
      (data) => {
        setItems(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [user.id]);

  const summary = useMemo(() => summarize(items), [items]);

  const add = useCallback(
    async (input: TransactionInput) => {
      validate(input);
      await transactionRepository.add(user.id, input);
    },
    [user.id],
  );

  const update = useCallback(
    async (tx: Transaction, input: Partial<TransactionInput>) => {
      if (isLocked(tx)) throw new AppError('Transações de meses fechados não podem ser editadas.');
      validate(input);
      await transactionRepository.update(tx.id, input);
    },
    [],
  );

  const remove = useCallback(async (tx: Transaction) => {
    if (isLocked(tx)) throw new AppError('Transações de meses fechados não podem ser excluídas.');
    await transactionRepository.remove(tx.id);
  }, []);

  return { items, summary, loading, error, add, update, remove };
}
