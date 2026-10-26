package com.moneywise.transactions.presentation.dto;

import java.util.List;

import com.moneywise.transactions.application.port.TransactionPage;

/** Página de transações com índices baseados em zero. */
public record TransactionPageResponseDTO(List<TransactionResponseDTO> content, int page, int size,
        long totalElements, int totalPages, boolean hasNext) {

    public TransactionPageResponseDTO {
        content = List.copyOf(content);
    }

    public static TransactionPageResponseDTO from(TransactionPage page) {
        return new TransactionPageResponseDTO(page.content().stream().map(TransactionResponseDTO::from).toList(),
                page.page(), page.size(), page.totalElements(), page.totalPages(), page.hasNext());
    }
}
