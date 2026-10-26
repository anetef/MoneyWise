package com.moneywise.transactions.application.port;

import java.util.List;

import com.moneywise.transactions.domain.Transaction;

/** Página de transações independente da tecnologia de persistência. */
public record TransactionPage(List<Transaction> content, int page, int size, long totalElements, int totalPages,
        boolean hasNext) {

    public TransactionPage {
        content = List.copyOf(content);
    }
}
