package com.moneywise.transactions.application.usecase.list;

import java.time.LocalDate;
import java.util.UUID;

import com.moneywise.transactions.application.port.TransactionPage;
import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.domain.Category;

/** Lista somente as transações do usuário, aplicando filtros e paginação. */
public class ListTransactions {

    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    private final TransactionRepository transactions;

    public ListTransactions(TransactionRepository transactions) {
        this.transactions = transactions;
    }

    public TransactionPage execute(UUID userId, String category, LocalDate from, LocalDate to, int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("A página deve ser maior ou igual a zero.");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException("O tamanho da página deve estar entre 1 e 100.");
        }

        Category categoryFilter = category == null || category.isBlank() ? null : Category.of(category);
        return transactions.findPageByUserIdAndFilters(userId, categoryFilter, from, to, page, size);
    }
}
