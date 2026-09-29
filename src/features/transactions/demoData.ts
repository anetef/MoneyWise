import type { Transaction } from './types';

/** Dados de exemplo (os mesmos valores do Figma) para o modo demonstração. */
export function createDemoTransactions(userId: string): Transaction[] {
  const now = new Date();
  const daysAgo = (d: number, h: number, m: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    date.setHours(h, m, 0, 0);
    return date;
  };
  const t = (
    id: string,
    type: Transaction['type'],
    amount: number,
    categoryId: string,
    description: string,
    date: Date,
  ): Transaction => ({ id, userId, type, amount, categoryId, description, date });

  return [
    // Saldo trazido do mês anterior (deixa o saldo igual ao do Figma: R$ 14.529,80).
    t('d0', 'income', 12317.3, 'other-income', 'Saldo do mês anterior', daysAgo(40, 9, 0)),
    t('d1', 'expense', 149.9, 'shopping', 'Mercado Livre', daysAgo(0, 14, 30)),
    t('d2', 'income', 450, 'pix', 'Pix recebido · João Silva', daysAgo(1, 9, 15)),
    t('d3', 'expense', 68.5, 'food', 'iFood', daysAgo(3, 20, 45)),
    t('d4', 'expense', 3100, 'home', 'Aluguel', daysAgo(5, 8, 0)),
    t('d5', 'income', 8000, 'salary', 'Salário', daysAgo(5, 7, 0)),
    t('d6', 'expense', 1632.1, 'food', 'Supermercado do mês', daysAgo(7, 18, 20)),
    t('d7', 'expense', 850, 'transport', 'Combustível e Uber', daysAgo(9, 12, 0)),
    t('d8', 'expense', 150, 'food', 'Restaurante', daysAgo(10, 21, 10)),
    t('d9', 'expense', 287, 'health', 'Farmácia', daysAgo(12, 10, 40)),
  ];
}
