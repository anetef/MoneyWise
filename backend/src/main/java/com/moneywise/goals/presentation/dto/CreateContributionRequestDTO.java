package com.moneywise.goals.presentation.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.moneywise.goals.domain.ContributionType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

public record CreateContributionRequestDTO(
        @NotNull UUID id,
        @NotNull @Schema(description = "ENTRADA (aporte) ou RETIRADA (L-07)") ContributionType type,
        @NotNull @DecimalMin("0.01") @Digits(integer = 17, fraction = 2) BigDecimal amount) {
}
