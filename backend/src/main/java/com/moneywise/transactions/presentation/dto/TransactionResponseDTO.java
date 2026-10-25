package com.moneywise.transactions.presentation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.moneywise.transactions.domain.Transaction;
import com.moneywise.transactions.domain.TransactionType;

/** Representação REST da transação, incluindo a versão usada na próxima edição. */
public record TransactionResponseDTO(
        UUID id,
        BigDecimal amount,
        String currency,
        LocalDate date,
        String category,
        TransactionType type,
        String description,
        Instant updatedAt) {

    public static TransactionResponseDTO from(Transaction transaction) {
        return new TransactionResponseDTO(
                transaction.getId(),
                transaction.getAmount().amount(),
                transaction.getAmount().currency().getCurrencyCode(),
                transaction.getDate(),
                transaction.getCategory().name(),
                transaction.getType(),
                transaction.getDescription(),
                transaction.getUpdatedAt());
    }
}
