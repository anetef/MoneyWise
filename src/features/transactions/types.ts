export type TransactionType = 'income' | 'expense';

/** Transação pessoal (coleção `transactions`). RF-05. */
export type Transaction = {
  id: string;
  userId: string;
  type: TransactionType;
  /** Sempre positivo; o sinal vem de `type`. */
  amount: number;
  categoryId: string;
  description: string;
  date: Date;
};

export type TransactionInput = Omit<Transaction, 'id' | 'userId'>;
