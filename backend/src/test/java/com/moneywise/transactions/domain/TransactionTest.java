package com.moneywise.transactions.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Currency;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.money.Money;

class TransactionTest {

    @Test
    @DisplayName("Cria transação com valor positivo")
    void shouldCreateTransactionWithPositiveAmount() {
        Transaction transaction = Transaction.create(UUID.randomUUID(), UUID.randomUUID(),
                Money.of("10.00", "BRL"), LocalDate.of(2026, 10, 1), Category.of("Comida"),
                TransactionType.EXPENSE);

        assertThat(transaction.getAmount()).isEqualTo(Money.of("10.00", "BRL"));
        assertThat(transaction.getType()).isEqualTo(TransactionType.EXPENSE);
        assertThat(transaction.getDescription()).isNull();
    }

    @Test
    @DisplayName("Armazena descrição opcional normalizada")
    void shouldStoreOptionalDescription() {
        Transaction transaction = Transaction.create(UUID.randomUUID(), UUID.randomUUID(),
                Money.of("10.00", "BRL"), LocalDate.of(2026, 10, 1), Category.of("Comida"),
                TransactionType.EXPENSE, "  Almoço  ");

        assertThat(transaction.getDescription()).isEqualTo("Almoço");
    }

    @Test
    @DisplayName("Rejeita valor zero ou negativo")
    void shouldRejectNonPositiveAmount() {
        assertThatThrownBy(() -> Transaction.create(UUID.randomUUID(), UUID.randomUUID(),
                new Money(BigDecimal.ZERO, Currency.getInstance("BRL")), LocalDate.now(),
                Category.of("Outros"), TransactionType.EXPENSE))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", "INVALID_TRANSACTION_AMOUNT");

        assertThatThrownBy(() -> Transaction.create(UUID.randomUUID(), UUID.randomUUID(),
                Money.of("-0.01", "BRL"), LocalDate.now(), Category.of("Outros"), TransactionType.EXPENSE))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", "INVALID_TRANSACTION_AMOUNT");
    }

    @Test
    @DisplayName("Disponibiliza categorias padrão e aceita categorias personalizadas")
    void shouldSupportDefaultAndCustomCategories() {
        assertThat(Category.defaults()).extracting(Category::name)
                .containsExactly("Comida", "Transporte", "Compras", "Casa", "Saúde", "Outros");
        assertThat(Category.of("Viagem").name()).isEqualTo("Viagem");
    }
}
