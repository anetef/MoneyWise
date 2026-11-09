package com.moneywise.transactions.presentation.dto;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

import com.moneywise.transactions.application.usecase.monthly.MonthlyTransactionSummary;

/** Contrato REST do resumo mensal do Dashboard. */
public record MonthlyTransactionSummaryResponseDTO(YearMonth month, String currency, BigDecimal totalIncome,
        BigDecimal totalExpense, BigDecimal balance, List<CategoryExpenseDTO> expensesByCategory) {

    public MonthlyTransactionSummaryResponseDTO {
        expensesByCategory = List.copyOf(expensesByCategory);
    }

    public static MonthlyTransactionSummaryResponseDTO from(MonthlyTransactionSummary summary) {
        return new MonthlyTransactionSummaryResponseDTO(summary.month(), summary.currency(), summary.totalIncome(),
                summary.totalExpense(), summary.balance(), summary.expensesByCategory().stream()
                        .map(expense -> new CategoryExpenseDTO(expense.category(), expense.amount()))
                        .toList());
    }

    public record CategoryExpenseDTO(String category, BigDecimal amount) {
    }
}
