package com.moneywise.goals.application.usecase.thermometer;

import java.time.Clock;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import com.moneywise.goals.application.port.ContributionRepository;
import com.moneywise.goals.application.port.ContributorNameQuery;
import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.domain.Goal;
import com.moneywise.goals.domain.MemberTotal;
import com.moneywise.goals.domain.Thermometer;
import com.moneywise.goals.domain.ThermometerCalculator;
import com.moneywise.groups.application.GroupAuthorizationService;
import com.moneywise.shared.exception.ResourceNotFoundException;
import com.moneywise.shared.money.Money;

public class GetGoalThermometer {

    private final GoalRepository goals;
    private final ContributionRepository contributions;
    private final ContributorNameQuery names;
    private final GroupAuthorizationService authorization;
    private final Clock clock;

    public GetGoalThermometer(GoalRepository goals, ContributionRepository contributions, ContributorNameQuery names,
            GroupAuthorizationService authorization, Clock clock) {
        this.goals = goals;
        this.contributions = contributions;
        this.names = names;
        this.authorization = authorization;
        this.clock = clock;
    }

    public GoalThermometerView execute(UUID goalId, UUID userId) {
        Goal goal = goals.findById(goalId)
                .filter(found -> authorization.isMember(found.getGroupId(), userId))
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));

        Money accumulated = contributions.balanceOf(goal);
        Thermometer thermometer = ThermometerCalculator.calculate(goal, accumulated, clock);
        return new GoalThermometerView(goal, thermometer, contributorsOf(goal));
    }

    private List<ContributorTotal> contributorsOf(Goal goal) {
        List<MemberTotal> totals = contributions.totalsByMember(goal);
        Map<UUID, String> namesById = names.findNamesByUserIds(
                totals.stream().map(MemberTotal::userId).filter(Objects::nonNull).toList());
        return totals.stream()
                .map(total -> new ContributorTotal(total.userId(),
                        total.userId() == null ? null : namesById.get(total.userId()), total.total()))
                .toList();
    }
}