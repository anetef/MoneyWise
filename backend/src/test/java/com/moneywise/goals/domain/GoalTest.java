package com.moneywise.goals.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.money.Money;

class GoalTest {

    private static final Instant NOW = Instant.parse("2026-11-01T12:00:00Z");
    private static final UUID USER_ID = UUID.randomUUID();

    private Goal goal() {
        return Goal.create(UUID.randomUUID(), UUID.randomUUID(), "  Viagem  ", Money.of("1000.00", "BRL"),
                LocalDate.of(2027, 6, 30), "plane", "Lazer", true, true, NOW);
    }

    private Contribution movement(Goal goal, ContributionType type, String amount) {
        return Contribution.restore(UUID.randomUUID(), goal.getId(), USER_ID, type, Money.of(amount, "BRL"), NOW);
    }

    @Test
    @DisplayName("Cria a meta ativa, com nome limpo e a moeda do valor da meta")
    void createsGoal() {
        Goal goal = goal();

        assertThat(goal.getName()).isEqualTo("Viagem");
        assertThat(goal.getCurrency().getCurrencyCode()).isEqualTo("BRL");
        assertThat(goal.isArchived()).isFalse();
        assertThat(goal.hasDeadline()).isTrue();
    }

    @Test
    @DisplayName("Aceita meta sem prazo (L-08)")
    void acceptsGoalWithoutDeadline() {
        Goal goal = Goal.create(UUID.randomUUID(), UUID.randomUUID(), "Reserva", Money.of("500.00", "BRL"),
                null, null, null, false, false, NOW);

        assertThat(goal.hasDeadline()).isFalse();
        assertThat(goal.getIcon()).isNull();
    }

    @Test
    @DisplayName("Recusa nome vazio e valor da meta zero ou negativo")
    void rejectsInvalidData() {
        assertThatThrownBy(() -> Goal.create(UUID.randomUUID(), UUID.randomUUID(), "  ",
                Money.of("100.00", "BRL"), null, null, null, false, false, NOW))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", Goal.INVALID_NAME);
        assertThatThrownBy(() -> Goal.create(UUID.randomUUID(), UUID.randomUUID(), "Meta",
                Money.of("0.00", "BRL"), null, null, null, false, false, NOW))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", Goal.INVALID_TARGET);
    }

    @Test
    @DisplayName("Acumulado = entradas − retiradas (L-07)")
    void balanceIsDepositsMinusWithdrawals() {
        Goal goal = goal();
        List<Contribution> movements = List.of(
                movement(goal, ContributionType.ENTRADA, "300.00"),
                movement(goal, ContributionType.ENTRADA, "200.00"),
                movement(goal, ContributionType.RETIRADA, "150.00"));

        assertThat(goal.balanceOf(movements)).isEqualTo(Money.of("350.00", "BRL"));
    }

    @Test
    @DisplayName("Sem movimentos, o acumulado é zero")
    void emptyBalanceIsZero() {
        assertThat(goal().balanceOf(List.of())).isEqualTo(Money.of("0.00", "BRL"));
    }

    @Test
    @DisplayName("Recusa retirada maior que o acumulado")
    void rejectsWithdrawalAboveBalance() {
        Goal goal = goal();

        assertThatThrownBy(() -> goal.registerContribution(UUID.randomUUID(), USER_ID, ContributionType.RETIRADA,
                Money.of("100.01", "BRL"), Money.of("100.00", "BRL"), NOW))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", Goal.INSUFFICIENT_BALANCE);
    }

    @Test
    @DisplayName("Permite retirar exatamente o acumulado")
    void allowsWithdrawingWholeBalance() {
        Contribution withdrawal = goal().registerContribution(UUID.randomUUID(), USER_ID,
                ContributionType.RETIRADA, Money.of("100.00", "BRL"), Money.of("100.00", "BRL"), NOW);

        assertThat(withdrawal.getType()).isEqualTo(ContributionType.RETIRADA);
    }

    @Test
    @DisplayName("Recusa aporte em outra moeda e em meta arquivada")
    void rejectsWrongCurrencyAndArchivedGoal() {
        assertThatThrownBy(() -> goal().registerContribution(UUID.randomUUID(), USER_ID, ContributionType.ENTRADA,
                Money.of("10.00", "USD"), Money.of("0.00", "BRL"), NOW))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", Goal.CURRENCY_MISMATCH);

        Goal archived = Goal.restore(UUID.randomUUID(), UUID.randomUUID(), "Antiga", Money.of("100.00", "BRL"),
                null, null, null, false, false, true, NOW);
        assertThatThrownBy(() -> archived.registerContribution(UUID.randomUUID(), USER_ID,
                ContributionType.ENTRADA, Money.of("10.00", "BRL"), Money.of("0.00", "BRL"), NOW))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", Goal.ARCHIVED);
    }

    @Test
    @DisplayName("Recusa aporte com valor zero")
    void rejectsZeroContribution() {
        assertThatThrownBy(() -> goal().registerContribution(UUID.randomUUID(), USER_ID, ContributionType.ENTRADA,
                Money.of("0.00", "BRL"), Money.of("0.00", "BRL"), NOW))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", Contribution.INVALID_AMOUNT);
    }
}
