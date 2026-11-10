package com.moneywise.goals.presentation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateGoalRequestDTO(
        @NotBlank @Size(max = 100) String name,
        @NotNull @DecimalMin("0.01") @Digits(integer = 17, fraction = 2) BigDecimal targetAmount,
        LocalDate deadline,
        @Size(max = 50) String icon,
        @Size(max = 50) String category,
        boolean monthlyReminder,
        boolean milestonesEnabled) {
}