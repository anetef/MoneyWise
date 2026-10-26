package com.moneywise.transactions.application.usecase.update;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.moneywise.transactions.domain.TransactionType;

/** Dados da edição, incluindo a versão lida pelo cliente para evitar sobrescrita por dados antigos. */
public record UpdateTransactionCommand(UUID id, UUID userId, BigDecimal amount, LocalDate date,
        String category, TransactionType type, String description, Instant updatedAt) {
}
