package com.moneywise.goals.application.usecase.list;

import com.moneywise.goals.domain.Goal;
import com.moneywise.goals.domain.Thermometer;

public record GoalSummary(Goal goal, Thermometer thermometer) {
}
