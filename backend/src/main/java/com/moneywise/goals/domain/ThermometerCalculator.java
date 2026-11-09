package com.moneywise.goals.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

import com.moneywise.shared.money.Money;


public final class ThermometerCalculator {

    static final BigDecimal TOLERANCE = new BigDecimal("0.10");
    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final int RATIO_SCALE = 4;

    private ThermometerCalculator() {
    }

    /**
     * @param clock relógio no fuso de negócio (America/Sao_Paulo): define "que dia é hoje"
     */
    public static Thermometer calculate(Goal goal, Money accumulated, Clock clock) {
        Objects.requireNonNull(goal, "A meta é obrigatória.");
        Objects.requireNonNull(accumulated, "O acumulado é obrigatório.");
        Objects.requireNonNull(clock, "O relógio é obrigatório.");
        if (!accumulated.currency().equals(goal.getCurrency())) {
            throw new IllegalArgumentException("O acumulado deve estar na moeda da meta.");
        }
        if (accumulated.amount().signum() < 0) {
            throw new IllegalArgumentException("O acumulado não pode ser negativo.");
        }

        LocalDate today = LocalDate.now(clock);
        Money target = goal.getTarget();
        BigDecimal progress = accumulated.amount().divide(target.amount(), RATIO_SCALE, RoundingMode.HALF_EVEN);

        ThermometerStatus status = status(goal, accumulated, progress, today, clock.getZone());
        BigDecimal percent = progress.multiply(HUNDRED).setScale(2, RoundingMode.HALF_EVEN);
        Money remaining = accumulated.isLessThan(target) ? target.minus(accumulated) : Money.zero(goal.getCurrency());
        Long daysLeft = goal.hasDeadline()
                ? Math.max(0, ChronoUnit.DAYS.between(today, goal.getDeadline()))
                : null;

        return new Thermometer(status, percent, accumulated, target, remaining, daysLeft);
    }

    private static ThermometerStatus status(Goal goal, Money accumulated, BigDecimal progress, LocalDate today,
            ZoneId zone) {
        if (!accumulated.isLessThan(goal.getTarget())) {
            return ThermometerStatus.ATINGIDA;
        }
        if (goal.hasDeadline() && today.isAfter(goal.getDeadline())) {
            return ThermometerStatus.VENCIDA;
        }
        if (accumulated.isZero()) {
            return ThermometerStatus.SEM_APORTES;
        }
        if (!goal.hasDeadline()) {
            return ThermometerStatus.EM_ANDAMENTO;
        }

        BigDecimal difference = progress.subtract(expectedProgress(goal, today, zone));
        if (difference.compareTo(TOLERANCE) >= 0) {
            return ThermometerStatus.ADIANTADA;
        }
        if (difference.compareTo(TOLERANCE.negate()) < 0) {
            return ThermometerStatus.ATRASADA;
        }
        return ThermometerStatus.NO_PRAZO;
    }

    private static BigDecimal expectedProgress(Goal goal, LocalDate today, ZoneId zone) {
        LocalDate start = LocalDate.ofInstant(goal.getCreatedAt(), zone);
        long totalDays = ChronoUnit.DAYS.between(start, goal.getDeadline());
        if (totalDays <= 0) {
            return BigDecimal.ONE;
        }
        long elapsedDays = Math.min(Math.max(ChronoUnit.DAYS.between(start, today), 0), totalDays);
        return BigDecimal.valueOf(elapsedDays).divide(BigDecimal.valueOf(totalDays), RATIO_SCALE, RoundingMode.HALF_EVEN);
    }
}