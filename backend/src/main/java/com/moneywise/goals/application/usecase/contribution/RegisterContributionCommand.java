package com.moneywise.goals.application.usecase.contribution;

import java.math.BigDecimal;
import java.util.UUID;

import com.moneywise.goals.domain.ContributionType;

public record RegisterContributionCommand(
        UUID id,
        UUID goalId,
        UUID userId,
        ContributionType type,
        BigDecimal amount) {
}