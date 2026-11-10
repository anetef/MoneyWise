package com.moneywise.goals.presentation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.moneywise.goals.application.usecase.list.GoalSummary;
import com.moneywise.goals.domain.Goal;
import com.moneywise.goals.domain.Thermometer;
import com.moneywise.goals.domain.ThermometerStatus;

public record GoalSummaryResponseDTO(
        UUID id,
        UUID groupId,
        String name,
        String icon,
        String category,
        String currency,
        BigDecimal targetAmount,
        BigDecimal accumulated,
        BigDecimal progressPercent,
        ThermometerStatus status,
        LocalDate deadline,
        Long daysLeft,
        boolean archived) {

    public static GoalSummaryResponseDTO from(GoalSummary summary) {
        Goal goal = summary.goal();
        Thermometer thermometer = summary.thermometer();
        return new GoalSummaryResponseDTO(goal.getId(), goal.getGroupId(), goal.getName(), goal.getIcon(),
                goal.getCategory(), goal.getCurrency().getCurrencyCode(), goal.getTarget().amount(),
                thermometer.accumulated().amount(), thermometer.progressPercent(), thermometer.status(),
                goal.getDeadline(), thermometer.daysLeft(), goal.isArchived());
    }
}