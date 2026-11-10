package com.moneywise.goals.presentation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.moneywise.goals.application.usecase.history.ContributionEntry;
import com.moneywise.goals.domain.Contribution;
import com.moneywise.goals.domain.ContributionType;

public record ContributionResponseDTO(
        UUID id,
        ContributionType type,
        BigDecimal amount,
        String currency,
        UUID userId,
        String userName,
        Instant createdAt) {

    public static ContributionResponseDTO from(ContributionEntry entry) {
        Contribution contribution = entry.contribution();
        return new ContributionResponseDTO(contribution.getId(), contribution.getType(),
                contribution.getAmount().amount(), contribution.getAmount().currency().getCurrencyCode(),
                contribution.getUserId(), entry.userName(), contribution.getCreatedAt());
    }
}