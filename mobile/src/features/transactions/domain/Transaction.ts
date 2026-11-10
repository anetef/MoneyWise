/** Tipo do movimento, igual ao enum da API. */
export type TransactionType = 'INCOME' | 'EXPENSE';

/** Transação do usuário, no formato usado pelas telas. */
export type Transaction = {
    id: string;
    /** Valor positivo em reais (ex.: 45.9). O sinal vem do `type`. */
    amount: number;
    currency: string;
    /** Data no formato AAAA-MM-DD. */
    date: string;
    category: string;
    type: TransactionType;
    description: string | null;
    /** Versão lida da API; é enviada de volta na edição. */
    updatedAt: string;
};

/** Dados preenchidos no formulário de criação/edição. */
export type TransactionInput = {
    amount: number;
    date: string;
    category: string;
    type: TransactionType;
    description?: string;
};

/** Uma página da listagem (a primeira página é 0). */
export type TransactionPage = {
    items: Transaction[];
    page: number;
    hasNext: boolean;
    totalElements: number;
};

/** Filtros opcionais da listagem. Datas no formato AAAA-MM-DD. */
export type TransactionFilters = {
    category?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
};

/** Resumo do mês para o Dashboard. */
export type MonthlySummary = {
    /** Mês no formato AAAA-MM. */
    month: string;
    currency: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    expensesByCategory: { category: string; amount: number }[];
};
