package com.moneywise.goals.domain;

import java.math.BigDecimal;

import com.moneywise.shared.money.Money;

/**
 *
 * @param progressPercent acumulado ÷ meta × 100, com 2 casas (pode passar de 100 quando a meta é superada)
 * @param remaining       quanto falta para atingir a meta; zero quando atingida
 * @param daysLeft        dias até o prazo (0 no próprio dia e depois dele); {@code null} para meta sem prazo
 */
public record Thermometer(
        ThermometerStatus status,
        BigDecimal progressPercent,
        Money accumulated,
        Money target,
        Money remaining,
        Long daysLeft) {
}