package com.moneywise.transactions.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ResourceNotFoundException;
import com.moneywise.shared.money.Money;
import com.moneywise.transactions.application.usecase.delete.DeleteTransaction;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.Transaction;
import com.moneywise.transactions.domain.TransactionType;

class DeleteTransactionTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID TRANSACTION_ID = UUID.randomUUID();
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-10-25T12:00:00Z"), ZoneOffset.UTC);

    private final FakeTransactionRepository transactions = new FakeTransactionRepository();
    private final DeleteTransaction deleteTransaction = new DeleteTransaction(transactions, CLOCK);

    @Test
    @DisplayName("Não exclui transações de mês fechado")
    void rejectsClosedMonth() {
        transactions.transactions.put(TRANSACTION_ID, transaction(LocalDate.of(2026, 9, 30)));

        assertThatThrownBy(() -> deleteTransaction.execute(TRANSACTION_ID, USER_ID))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", "TRANSACTION_MONTH_CLOSED");

        assertThat(transactions.deletes).isZero();
    }

    @Test
    @DisplayName("Retorna não encontrada para transação de outro usuário")
    void hidesTransactionsOwnedByAnotherUser() {
        assertThatThrownBy(() -> deleteTransaction.execute(TRANSACTION_ID, USER_ID))
                .isInstanceOf(ResourceNotFoundException.class);

        assertThat(transactions.deletes).isZero();
    }

    @Test
    @DisplayName("Permite excluir no último dia até a meia-noite de São Paulo")
    void allowsDeleteUntilSaoPauloMonthBoundary() {
        Clock brazilClock = Clock.fixed(Instant.parse("2026-11-01T00:30:00Z"),
                ZoneId.of("America/Sao_Paulo"));
        DeleteTransaction brazilDelete = new DeleteTransaction(transactions, brazilClock);
        transactions.transactions.put(TRANSACTION_ID, transaction(LocalDate.of(2026, 10, 31)));

        brazilDelete.execute(TRANSACTION_ID, USER_ID);

        assertThat(transactions.deletes).isEqualTo(1);
        assertThat(transactions.transactions).doesNotContainKey(TRANSACTION_ID);
    }
    private Transaction transaction(LocalDate date) {
        return Transaction.restore(TRANSACTION_ID, USER_ID, Money.of("20.00", "BRL"), date,
                Category.of("Comida"), TransactionType.EXPENSE, null, Instant.parse("2026-10-10T12:00:00Z"));
    }
}
