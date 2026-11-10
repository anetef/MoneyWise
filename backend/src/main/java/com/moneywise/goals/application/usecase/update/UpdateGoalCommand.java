package com.moneywise.goals.application.usecase.update;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UpdateGoalCommand(
        UUID goalId,
        UUID userId,
        String name,
        BigDecimal targetAmount,
        LocalDate deadline,
        String icon,
        String category,
        boolean monthlyReminder,
        boolean milestonesEnabled) {
}