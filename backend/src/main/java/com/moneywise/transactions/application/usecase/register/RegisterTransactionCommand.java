package com.moneywise.transactions.application.usecase.register;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.moneywise.transactions.domain.TransactionType;

/** Dados para registrar uma transação; o usuário é obtido do access token. */
public record RegisterTransactionCommand(UUID id, UUID userId, BigDecimal amount, LocalDate date,
        String category, TransactionType type, String description) {
}
