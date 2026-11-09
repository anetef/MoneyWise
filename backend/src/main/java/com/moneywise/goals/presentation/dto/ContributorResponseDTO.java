package com.moneywise.goals.presentation.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.moneywise.goals.application.usecase.thermometer.ContributorTotal;

public record ContributorResponseDTO(UUID userId, String name, BigDecimal total) {

    public static ContributorResponseDTO from(ContributorTotal contributor) {
        return new ContributorResponseDTO(contributor.userId(), contributor.name(), contributor.total().amount());
    }
}