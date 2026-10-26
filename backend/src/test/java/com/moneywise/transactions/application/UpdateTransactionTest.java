package com.moneywise.transactions.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
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
import com.moneywise.transactions.application.usecase.update.UpdateTransaction;
import com.moneywise.transactions.application.usecase.update.UpdateTransactionCommand;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.Transaction;
import com.moneywise.transactions.domain.TransactionType;

class UpdateTransactionTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID TRANSACTION_ID = UUID.randomUUID();
    private static final Instant CURRENT_VERSION = Instant.parse("2026-10-10T12:00:00Z");
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-10-25T12:00:00Z"), ZoneOffset.UTC);

    private final FakeTransactionRepository transactions = new FakeTransactionRepository();
    private final UpdateTransaction updateTransaction = new UpdateTransaction(transactions, CLOCK);

    @Test
    @DisplayName("Aplica uma edição válida da versão atual")
    void updatesCurrentVersion() {
        Transaction current = transaction(LocalDate.of(2026, 10, 10), CURRENT_VERSION);
        transactions.transactions.put(TRANSACTION_ID, current);

        Transaction result = updateTransaction.execute(command(CURRENT_VERSION, LocalDate.of(2026, 10, 11)));

        assertThat(result.getDate()).isEqualTo(LocalDate.of(2026, 10, 11));
        assertThat(result.getAmount()).isEqualTo(Money.of("30.00", "BRL"));
        assertThat(transactions.updates).isEqualTo(1);
    }

    @Test
    @DisplayName("Mantém a versão mais recente quando recebe uma edição antiga")
    void staleUpdateReturnsLatestWithoutOverwriting() {
        Transaction current = transaction(LocalDate.of(2026, 10, 10), CURRENT_VERSION);
        transactions.transactions.put(TRANSACTION_ID, current);

        Transaction result = updateTransaction.execute(command(CURRENT_VERSION.minusSeconds(10),
                LocalDate.of(2026, 10, 11)));

        assertThat(result).isSameAs(current);
        assertThat(transactions.updates).isZero();
    }

    @Test
    @DisplayName("Não edita transações de mês fechado")
    void rejectsClosedMonth() {
        transactions.transactions.put(TRANSACTION_ID, transaction(LocalDate.of(2026, 9, 30), CURRENT_VERSION));

        assertThatThrownBy(() -> updateTransaction.execute(command(CURRENT_VERSION, LocalDate.of(2026, 10, 1))))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", "TRANSACTION_MONTH_CLOSED");

        assertThat(transactions.updates).isZero();
    }

    @Test
    @DisplayName("Retorna não encontrada para transação de outro usuário")
    void hidesTransactionsOwnedByAnotherUser() {
        assertThatThrownBy(() -> updateTransaction.execute(command(CURRENT_VERSION, LocalDate.of(2026, 10, 1))))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Permite editar no último dia até a meia-noite de São Paulo")
    void allowsUpdateUntilSaoPauloMonthBoundary() {
        Clock brazilClock = Clock.fixed(Instant.parse("2026-11-01T00:30:00Z"),
                ZoneId.of("America/Sao_Paulo"));
        UpdateTransaction brazilUpdate = new UpdateTransaction(transactions, brazilClock);
        transactions.transactions.put(TRANSACTION_ID,
                transaction(LocalDate.of(2026, 10, 31), CURRENT_VERSION));

        Transaction result = brazilUpdate.execute(command(CURRENT_VERSION, LocalDate.of(2026, 10, 31)));

        assertThat(result.getDate()).isEqualTo(LocalDate.of(2026, 10, 31));
        assertThat(transactions.updates).isEqualTo(1);
    }
    private Transaction transaction(LocalDate date, Instant updatedAt) {
        return Transaction.restore(TRANSACTION_ID, USER_ID, Money.of("20.00", "BRL"), date,
                Category.of("Comida"), TransactionType.EXPENSE, null, updatedAt);
    }

    private UpdateTransactionCommand command(Instant version, LocalDate date) {
        return new UpdateTransactionCommand(TRANSACTION_ID, USER_ID, new BigDecimal("30.00"), date,
                "Compras", TransactionType.INCOME, "Nova versão", version);
    }
}
