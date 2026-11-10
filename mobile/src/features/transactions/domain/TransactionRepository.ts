import type {
    MonthlySummary,
    Transaction,
    TransactionFilters,
    TransactionInput,
    TransactionPage,
} from './Transaction';

/**
 * Acesso às transações do usuário logado.
 * Cada método corresponde a um endpoint da API.
 */
export interface TransactionRepository {
    /** GET /transactions — ordenadas da mais recente para a mais antiga. */
    list(filters?: TransactionFilters): Promise<TransactionPage>;

    /** POST /transactions — o ID é gerado no app (reenvio é seguro). */
    create(input: TransactionInput): Promise<Transaction>;

    /** PUT /transactions/{id} — precisa do `updatedAt` lido antes. */
    update(transaction: Transaction, input: TransactionInput): Promise<Transaction>;

    /** DELETE /transactions/{id} */
    remove(id: string): Promise<void>;

    /** GET /reports/monthly?month=AAAA-MM */
    getMonthlySummary(month: string): Promise<MonthlySummary>;
}
