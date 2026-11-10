package com.moneywise.goals.infrastructure.persistence;

import java.math.BigDecimal;
import java.util.UUID;

public interface GoalBalanceRow {

    UUID getGoalId();

    BigDecimal getTotal();
}