package com.moneywise.goals.presentation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.moneywise.goals.application.usecase.thermometer.GoalThermometerView;
import com.moneywise.goals.domain.Thermometer;
import com.moneywise.goals.domain.ThermometerStatus;

public record ThermometerResponseDTO(
        UUID goalId,
        String name,
        ThermometerStatus status,
        BigDecimal progressPercent,
        BigDecimal accumulated,
        BigDecimal targetAmount,
        BigDecimal remaining,
        String currency,
        LocalDate deadline,
        Long daysLeft,
        List<ContributorResponseDTO> contributors) {

    public static ThermometerResponseDTO from(GoalThermometerView view) {
        Thermometer thermometer = view.thermometer();
        return new ThermometerResponseDTO(
                view.goal().getId(),
                view.goal().getName(),
                thermometer.status(),
                thermometer.progressPercent(),
                thermometer.accumulated().amount(),
                thermometer.target().amount(),
                thermometer.remaining().amount(),
                view.goal().getCurrency().getCurrencyCode(),
                view.goal().getDeadline(),
                thermometer.daysLeft(),
                view.contributors().stream().map(ContributorResponseDTO::from).toList());
    }
}