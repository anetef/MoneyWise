package com.moneywise.transactions.domain;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Objects;

/** Regra RN03: transações de meses anteriores ao atual não podem ser alteradas. */
public final class MonthClosingPolicy {

    private MonthClosingPolicy() {
    }

    public static boolean isEditable(LocalDate transactionDate, YearMonth currentMonth) {
        Objects.requireNonNull(transactionDate, "A data da transação é obrigatória.");
        Objects.requireNonNull(currentMonth, "O mês atual é obrigatório.");
        return !YearMonth.from(transactionDate).isBefore(currentMonth);
    }
}
