import { apiRequest } from '../../../core/api/apiClient';
import type {
    MonthlySummary,
    Transaction,
    TransactionFilters,
    TransactionInput,
    TransactionPage,
    TransactionType,
} from '../domain/Transaction';
import type { TransactionRepository } from '../domain/TransactionRepository';
import { createId } from './createId';

// Formatos que a API devolve (iguais ao Swagger).
type TransactionResponse = {
    id: string;
    amount: number | string;
    currency: string;
    date: string;
    category: string;
    type: TransactionType;
    description: string | null;
    updatedAt: string;
};

type TransactionPageResponse = {
    content: TransactionResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
};

type MonthlySummaryResponse = {
    month: string;
    currency: string;
    totalIncome: number | string;
    totalExpense: number | string;
    balance: number | string;
    expensesByCategory: { category: string; amount: number | string }[];
};

function toTransaction(response: TransactionResponse): Transaction {
    return {
        ...response,
        amount: Number(response.amount),
        description: response.description ?? null,
    };
}

/** Monta o corpo enviado na criação e na edição. */
function toBody(input: TransactionInput) {
    const description = input.description?.trim();

    return {
        // Arredonda para centavos para não mandar 45.900000001.
        amount: Math.round(input.amount * 100) / 100,
        date: input.date,
        category: input.category,
        type: input.type,
        description: description ? description : null,
    };
}

/** Monta a query string, ignorando filtros vazios. */
function toQuery(filters: TransactionFilters): string {
    const params = Object.entries(filters)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`);

    return params.length > 0 ? `?${params.join('&')}` : '';
}

/**
 * Repository real: conversa com a API do MoneyWise.
 */
export class ApiTransactionRepository implements TransactionRepository {
    async list(filters: TransactionFilters = {}): Promise<TransactionPage> {
        const data = await apiRequest<TransactionPageResponse>(
            `/transactions${toQuery(filters)}`,
        );

        return {
            items: data.content.map(toTransaction),
            page: data.page,
            hasNext: data.hasNext,
            totalElements: data.totalElements,
        };
    }

    async create(input: TransactionInput): Promise<Transaction> {
        const data = await apiRequest<TransactionResponse>('/transactions', {
            method: 'POST',
            body: { id: createId(), ...toBody(input) },
        });

        return toTransaction(data);
    }

    async update(transaction: Transaction, input: TransactionInput): Promise<Transaction> {
        const data = await apiRequest<TransactionResponse>(`/transactions/${transaction.id}`, {
            method: 'PUT',
            body: { ...toBody(input), updatedAt: transaction.updatedAt },
        });

        return toTransaction(data);
    }

    async remove(id: string): Promise<void> {
        await apiRequest<void>(`/transactions/${id}`, { method: 'DELETE' });
    }

    async getMonthlySummary(month: string): Promise<MonthlySummary> {
        const data = await apiRequest<MonthlySummaryResponse>(
            `/reports/monthly?month=${encodeURIComponent(month)}`,
        );

        return {
            month: data.month,
            currency: data.currency,
            totalIncome: Number(data.totalIncome),
            totalExpense: Number(data.totalExpense),
            balance: Number(data.balance),
            expensesByCategory: data.expensesByCategory.map((item) => ({
                category: item.category,
                amount: Number(item.amount),
            })),
        };
    }
}

export const transactionRepository: TransactionRepository = new ApiTransactionRepository();
