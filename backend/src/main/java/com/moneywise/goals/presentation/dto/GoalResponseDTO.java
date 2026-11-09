package com.moneywise.goals.presentation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.moneywise.goals.domain.Goal;

public record GoalResponseDTO(
        UUID id,
        UUID groupId,
        String name,
        BigDecimal targetAmount,
        String currency,
        LocalDate deadline,
        String icon,
        String category,
        boolean monthlyReminder,
        boolean milestonesEnabled,
        boolean archived,
        Instant createdAt) {

    public static GoalResponseDTO from(Goal goal) {
        return new GoalResponseDTO(goal.getId(), goal.getGroupId(), goal.getName(), goal.getTarget().amount(),
                goal.getCurrency().getCurrencyCode(), goal.getDeadline(), goal.getIcon(), goal.getCategory(),
                goal.isMonthlyReminder(), goal.isMilestonesEnabled(), goal.isArchived(), goal.getCreatedAt());
    }
}