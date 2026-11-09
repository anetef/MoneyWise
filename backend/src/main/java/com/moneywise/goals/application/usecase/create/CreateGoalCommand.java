package com.moneywise.goals.application.usecase.create;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateGoalCommand(
        UUID id,
        UUID groupId,
        UUID userId,
        String name,
        BigDecimal targetAmount,
        LocalDate deadline,
        String icon,
        String category,
        boolean monthlyReminder,
        boolean milestonesEnabled) {
}