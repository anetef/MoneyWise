package com.moneywise.transactions.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.YearMonth;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MonthClosingPolicyTest {

    @Test
    @DisplayName("Permite alterar transação do mês atual")
    void allowsCurrentMonth() {
        assertThat(MonthClosingPolicy.isEditable(LocalDate.of(2026, 10, 1), YearMonth.of(2026, 10))).isTrue();
    }

    @Test
    @DisplayName("Bloqueia alteração de mês anterior")
    void blocksPreviousMonth() {
        assertThat(MonthClosingPolicy.isEditable(LocalDate.of(2026, 9, 30), YearMonth.of(2026, 10))).isFalse();
    }

    @Test
    @DisplayName("Aplica fechamento corretamente na virada do ano")
    void handlesYearRollover() {
        assertThat(MonthClosingPolicy.isEditable(LocalDate.of(2025, 12, 31), YearMonth.of(2026, 1))).isFalse();
        assertThat(MonthClosingPolicy.isEditable(LocalDate.of(2026, 1, 1), YearMonth.of(2026, 1))).isTrue();
    }
}
