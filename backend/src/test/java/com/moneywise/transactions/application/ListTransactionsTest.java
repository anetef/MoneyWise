package com.moneywise.transactions.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.shared.money.Money;
import com.moneywise.transactions.application.usecase.list.ListTransactions;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.Transaction;
import com.moneywise.transactions.domain.TransactionType;

class ListTransactionsTest {

    private final FakeTransactionRepository transactions = new FakeTransactionRepository();
    private final ListTransactions listTransactions = new ListTransactions(transactions);

    @Test
    @DisplayName("Lista todas as transações do usuário na página solicitada quando não há filtros")
    void listsOwnTransactionsWithoutFilters() {
        UUID ownerId = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();
        Transaction newest = transaction(ownerId, "Casa", LocalDate.of(2026, 10, 10));
        Transaction older = transaction(ownerId, "Comida", LocalDate.of(2026, 10, 9));
        Transaction foreign = transaction(otherId, "Casa", LocalDate.of(2026, 10, 11));
        transactions.transactions.put(newest.getId(), newest);
        transactions.transactions.put(older.getId(), older);
        transactions.transactions.put(foreign.getId(), foreign);

        var result = listTransactions.execute(ownerId, null, null, null, 0, 20);

        assertThat(result.content()).containsExactly(newest, older);
        assertThat(result.totalElements()).isEqualTo(2);
        assertThat(result.hasNext()).isFalse();
    }

    @Test
    @DisplayName("Filtra, pagina e ordena transações sem expor registros de outros usuários")
    void filtersAndPaginatesOnlyTheAuthenticatedUsersTransactions() {
        UUID ownerId = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();
        Transaction newest = transaction(ownerId, "Comida", LocalDate.of(2026, 10, 10));
        Transaction second = transaction(ownerId, "Comida", LocalDate.of(2026, 10, 9));
        transactions.transactions.put(newest.getId(), newest);
        transactions.transactions.put(second.getId(), second);
        Transaction foreign = transaction(otherId, "Comida", LocalDate.of(2026, 10, 11));
        transactions.transactions.put(foreign.getId(), foreign);
        Transaction wrongCategory = transaction(ownerId, "Casa", LocalDate.of(2026, 10, 10));
        transactions.transactions.put(wrongCategory.getId(), wrongCategory);

        var result = listTransactions.execute(ownerId, " Comida ", LocalDate.of(2026, 10, 9),
                LocalDate.of(2026, 10, 10), 0, 1);

        assertThat(result.content()).containsExactly(newest);
        assertThat(result.page()).isZero();
        assertThat(result.size()).isEqualTo(1);
        assertThat(result.totalElements()).isEqualTo(2);
        assertThat(result.totalPages()).isEqualTo(2);
        assertThat(result.hasNext()).isTrue();
    }

    @Test
    @DisplayName("Rejeita parâmetros de paginação fora dos limites")
    void rejectsInvalidPagination() {
        UUID userId = UUID.randomUUID();

        assertThatThrownBy(() -> listTransactions.execute(userId, null, null, null, -1, 20))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> listTransactions.execute(userId, null, null, null, 0, 101))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private Transaction transaction(UUID userId, String category, LocalDate date) {
        return Transaction.create(UUID.randomUUID(), userId, Money.of("12.34", "BRL"), date,
                Category.of(category), TransactionType.EXPENSE);
    }
}
