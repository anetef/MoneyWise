package com.moneywise.goals.application.usecase.thermometer;

import java.util.List;

import com.moneywise.goals.domain.Goal;
import com.moneywise.goals.domain.Thermometer;

public record GoalThermometerView(Goal goal, Thermometer thermometer, List<ContributorTotal> contributors) {
}
