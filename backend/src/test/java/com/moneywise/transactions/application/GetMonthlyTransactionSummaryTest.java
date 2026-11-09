package com.moneywise.transactions.application;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.shared.money.Money;
import com.moneywise.transactions.application.usecase.monthly.GetMonthlyTransactionSummary;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.Transaction;
import com.moneywise.transactions.domain.TransactionType;

class GetMonthlyTransactionSummaryTest {

    private final FakeTransactionRepository transactions = new FakeTransactionRepository();
    private final GetMonthlyTransactionSummary getSummary = new GetMonthlyTransactionSummary(transactions);

    @Test
    @DisplayName("Calcula receitas, despesas, saldo e categorias só para o usuário e mês pedidos")
    void summarizesOnlyTheRequestedUsersMonth() {
        UUID ownerId = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();
        add(ownerId, "1000.00", "Salário", TransactionType.INCOME, LocalDate.of(2026, 10, 2));
        add(ownerId, "80.00", "Comida", TransactionType.EXPENSE, LocalDate.of(2026, 10, 5));
        add(ownerId, "20.00", "Comida", TransactionType.EXPENSE, LocalDate.of(2026, 10, 6));
        add(ownerId, "50.00", "Casa", TransactionType.EXPENSE, LocalDate.of(2026, 10, 7));
        add(ownerId, "900.00", "Salário", TransactionType.INCOME, LocalDate.of(2026, 9, 2));
        add(otherId, "700.00", "Salário", TransactionType.INCOME, LocalDate.of(2026, 10, 2));
        add(otherId, "500.00", "Comida", TransactionType.EXPENSE, LocalDate.of(2026, 10, 3));

        var summary = getSummary.execute(ownerId, YearMonth.of(2026, 10));

        assertThat(summary.month()).isEqualTo(YearMonth.of(2026, 10));
        assertThat(summary.currency()).isEqualTo("BRL");
        assertThat(summary.totalIncome()).isEqualByComparingTo("1000.00");
        assertThat(summary.totalExpense()).isEqualByComparingTo("150.00");
        assertThat(summary.balance()).isEqualByComparingTo("850.00");
        assertThat(summary.expensesByCategory()).extracting("category").containsExactly("Comida", "Casa");
        assertThat(summary.expensesByCategory()).extracting("amount")
                .containsExactly(new java.math.BigDecimal("100.00"), new java.math.BigDecimal("50.00"));
    }

    @Test
    @DisplayName("Retorna zeros e categorias vazias quando o mês não tem transações")
    void returnsZeroTotalsForAnEmptyMonth() {
        UUID userId = UUID.randomUUID();

        var summary = getSummary.execute(userId, YearMonth.of(2026, 10));

        assertThat(summary.totalIncome()).isEqualByComparingTo("0.00");
        assertThat(summary.totalExpense()).isEqualByComparingTo("0.00");
        assertThat(summary.balance()).isEqualByComparingTo("0.00");
        assertThat(summary.expensesByCategory()).isEmpty();
    }

    private void add(UUID userId, String amount, String category, TransactionType type, LocalDate date) {
        Transaction transaction = Transaction.create(UUID.randomUUID(), userId, Money.of(amount, "BRL"), date,
                Category.of(category), type);
        transactions.transactions.put(transaction.getId(), transaction);
    }
}
