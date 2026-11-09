package com.moneywise.goals.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.shared.money.Money;

class ThermometerCalculatorTest {

    private static final ZoneId SAO_PAULO = ZoneId.of("America/Sao_Paulo");
    private static final Instant CREATED_AT = Instant.parse("2026-01-01T12:00:00Z");
    private static final LocalDate DEADLINE = LocalDate.of(2026, 11, 1);

    private static final Clock JUNE_1 = clockAt("2026-06-01T15:00:00Z");

    private static Clock clockAt(String instant) {
        return Clock.fixed(Instant.parse(instant), SAO_PAULO);
    }

    private static Goal goal(LocalDate deadline) {
        return Goal.create(UUID.randomUUID(), UUID.randomUUID(), "Viagem", brl("1000.00"), deadline,
                null, null, false, false, CREATED_AT);
    }

    private static Money brl(String amount) {
        return Money.of(amount, "BRL");
    }

    private static Thermometer calculate(String accumulated, Clock clock) {
        return ThermometerCalculator.calculate(goal(DEADLINE), brl(accumulated), clock);
    }

    // ---------- Os seis cenários do critério de aceitação ----------

    @Test
    @DisplayName("Meta atingida: acumulado igual ao valor da meta")
    void reachedGoal() {
        Thermometer result = calculate("1000.00", JUNE_1);

        assertThat(result.status()).isEqualTo(ThermometerStatus.ATINGIDA);
        assertThat(result.progressPercent()).isEqualByComparingTo("100.00");
        assertThat(result.remaining()).isEqualTo(brl("0.00"));
    }

    @Test
    @DisplayName("Sem aportes: acumulado zero")
    void noContributions() {
        Thermometer result = calculate("0.00", JUNE_1);

        assertThat(result.status()).isEqualTo(ThermometerStatus.SEM_APORTES);
        assertThat(result.progressPercent()).isEqualByComparingTo("0.00");
        assertThat(result.remaining()).isEqualTo(brl("1000.00"));
    }

    @Test
    @DisplayName("Adiantada: 70% guardado com 49,67% do tempo passado")
    void aheadOfSchedule() {
        Thermometer result = calculate("700.00", JUNE_1);

        assertThat(result.status()).isEqualTo(ThermometerStatus.ADIANTADA);
        assertThat(result.progressPercent()).isEqualByComparingTo("70.00");
    }

    @Test
    @DisplayName("Atrasada: 20% guardado com 49,67% do tempo passado")
    void behindSchedule() {
        assertThat(calculate("200.00", JUNE_1).status()).isEqualTo(ThermometerStatus.ATRASADA);
    }

    @Test
    @DisplayName("Prazo vencido: dia seguinte ao prazo, meta não atingida")
    void overdue() {
        Thermometer result = calculate("500.00", clockAt("2026-11-02T15:00:00Z"));

        assertThat(result.status()).isEqualTo(ThermometerStatus.VENCIDA);
        assertThat(result.daysLeft()).isZero();
    }

    @Test
    @DisplayName("Retirada reduz o acumulado e o status (de adiantada para atrasada)")
    void withdrawalReducesAccumulated() {
        Goal goal = goal(DEADLINE);
        List<Contribution> movements = List.of(
                Contribution.restore(UUID.randomUUID(), goal.getId(), UUID.randomUUID(), ContributionType.ENTRADA,
                        brl("700.00"), CREATED_AT),
                Contribution.restore(UUID.randomUUID(), goal.getId(), UUID.randomUUID(), ContributionType.RETIRADA,
                        brl("400.00"), CREATED_AT));

        Thermometer beforeWithdrawal = ThermometerCalculator.calculate(goal, brl("700.00"), JUNE_1);
        Thermometer afterWithdrawal = ThermometerCalculator.calculate(goal, goal.balanceOf(movements), JUNE_1);

        assertThat(beforeWithdrawal.status()).isEqualTo(ThermometerStatus.ADIANTADA);
        assertThat(afterWithdrawal.accumulated()).isEqualTo(brl("300.00"));
        assertThat(afterWithdrawal.status()).isEqualTo(ThermometerStatus.ATRASADA);
    }


    @Test
    @DisplayName("No prazo: diferença de até 10 pontos do esperado")
    void onSchedule() {
        assertThat(calculate("500.00", JUNE_1).status()).isEqualTo(ThermometerStatus.NO_PRAZO);
    }

    @Test
    @DisplayName("Meta superada continua atingida, mesmo depois do prazo, com mais de 100%")
    void exceededGoalAfterDeadline() {
        Thermometer result = calculate("1200.00", clockAt("2026-12-15T15:00:00Z"));

        assertThat(result.status()).isEqualTo(ThermometerStatus.ATINGIDA);
        assertThat(result.progressPercent()).isEqualByComparingTo("120.00");
    }

    @Test
    @DisplayName("No próprio dia do prazo a meta ainda não venceu")
    void deadlineDayIsNotOverdue() {
        Thermometer result = calculate("500.00", clockAt("2026-11-01T15:00:00Z"));

        assertThat(result.status()).isNotEqualTo(ThermometerStatus.VENCIDA);
        assertThat(result.daysLeft()).isZero();
    }

    @Test
    @DisplayName("Às 22h do dia do prazo em São Paulo (já dia seguinte em UTC), ainda não venceu")
    void usesBusinessTimeZone() {
        Thermometer result = calculate("500.00", clockAt("2026-11-02T01:00:00Z"));

        assertThat(result.status()).isNotEqualTo(ThermometerStatus.VENCIDA);
    }

    @Test
    @DisplayName("Meta sem prazo: em andamento, sem dias restantes")
    void goalWithoutDeadline() {
        Thermometer result = ThermometerCalculator.calculate(goal(null), brl("300.00"), JUNE_1);

        assertThat(result.status()).isEqualTo(ThermometerStatus.EM_ANDAMENTO);
        assertThat(result.daysLeft()).isNull();
    }

    @Test
    @DisplayName("Mostra os dias restantes até o prazo")
    void daysLeft() {
        assertThat(calculate("500.00", JUNE_1).daysLeft()).isEqualTo(153L);
    }

    @Test
    @DisplayName("O resultado é o mesmo, chamado por qualquer membro (RN01)")
    void sameResultForEveryone() {
        Goal goal = goal(DEADLINE);

        assertThat(ThermometerCalculator.calculate(goal, brl("500.00"), JUNE_1))
                .isEqualTo(ThermometerCalculator.calculate(goal, brl("500.00"), JUNE_1));
    }

    @Test
    @DisplayName("A margem é de 10 pontos percentuais")
    void toleranceIsTenPoints() {
        assertThat(ThermometerCalculator.TOLERANCE).isEqualByComparingTo(new BigDecimal("0.10"));
    }
}