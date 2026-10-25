package com.moneywise.transactions.presentation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.moneywise.transactions.domain.TransactionType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Corpo de criação; o ID é gerado no cliente para suportar sincronização idempotente. */
public record CreateTransactionRequestDTO(
        @NotNull UUID id,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        @NotNull LocalDate date,
        @NotBlank String category,
        @NotNull TransactionType type,
        String description) {
}
