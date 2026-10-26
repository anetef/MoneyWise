package com.moneywise.transactions.presentation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.moneywise.transactions.domain.TransactionType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Corpo de edição; updatedAt identifica a versão que o cliente leu. */
public record UpdateTransactionRequestDTO(
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        @NotNull LocalDate date,
        @NotBlank String category,
        @NotNull TransactionType type,
        String description,
        @NotNull Instant updatedAt) {
}
