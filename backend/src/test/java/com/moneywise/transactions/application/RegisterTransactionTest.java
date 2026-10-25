package com.moneywise.transactions.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Currency;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.money.Money;
import com.moneywise.transactions.application.usecase.register.RegisterTransaction;
import com.moneywise.transactions.application.usecase.register.RegisterTransactionCommand;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.Transaction;
import com.moneywise.transactions.domain.TransactionType;

class RegisterTransactionTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID TRANSACTION_ID = UUID.randomUUID();
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-10-25T12:00:00Z"), ZoneOffset.UTC);

    private final FakeTransactionRepository transactions = new FakeTransactionRepository();
    private final RegisterTransaction registerTransaction = new RegisterTransaction(transactions, CLOCK);

    @Test
    @DisplayName("Cria a transação usando a moeda do perfil e limpa a categoria")
    void createsTransactionWithProfileCurrency() {
        transactions.currency = Currency.getInstance("BRL");

        Transaction result = registerTransaction.execute(command(LocalDate.of(2026, 10, 15)));

        assertThat(result.getId()).isEqualTo(TRANSACTION_ID);
        assertThat(result.getAmount()).isEqualTo(Money.of("12.50", "BRL"));
        assertThat(result.getCategory()).isEqualTo(Category.of("Comida"));
        assertThat(transactions.saves).isEqualTo(1);
    }

    @Test
    @DisplayName("Reenvio do mesmo ID pelo mesmo usuário devolve a transação já salva")
    void returnsExistingTransactionForIdempotentRetry() {
        Transaction existing = Transaction.restore(TRANSACTION_ID, USER_ID, Money.of("20.00", "BRL"),
                LocalDate.of(2026, 10, 10), Category.of("Casa"), TransactionType.EXPENSE, null,
                Instant.parse("2026-10-10T12:00:00Z"));
        transactions.transactions.put(TRANSACTION_ID, existing);

        Transaction result = registerTransaction.execute(command(LocalDate.of(2026, 9, 10)));

        assertThat(result).isSameAs(existing);
        assertThat(transactions.saves).isZero();
    }

    @Test
    @DisplayName("Rejeita criação em um mês fechado")
    void rejectsCreationInClosedMonth() {
        assertThatThrownBy(() -> registerTransaction.execute(command(LocalDate.of(2026, 9, 30))))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", RegisterTransaction.TRANSACTION_MONTH_CLOSED);

        assertThat(transactions.saves).isZero();
    }

    private RegisterTransactionCommand command(LocalDate date) {
        return new RegisterTransactionCommand(TRANSACTION_ID, USER_ID, new BigDecimal("12.50"), date,
                " Comida ", TransactionType.EXPENSE, "  Almoço  ");
    }
}
