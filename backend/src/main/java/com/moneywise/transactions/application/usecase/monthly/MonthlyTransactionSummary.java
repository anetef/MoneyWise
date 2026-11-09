package com.moneywise.transactions.application.usecase.monthly;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

/** Resumo de receitas, despesas, saldo e despesas agrupadas por categoria. */
public record MonthlyTransactionSummary(YearMonth month, String currency, BigDecimal totalIncome,
        BigDecimal totalExpense, BigDecimal balance, List<CategoryExpense> expensesByCategory) {

    public MonthlyTransactionSummary {
        expensesByCategory = List.copyOf(expensesByCategory);
    }

    public record CategoryExpense(String category, BigDecimal amount) {
    }
}
