package com.moneywise.goals.application.usecase.list;

import java.time.Clock;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.moneywise.goals.application.port.ContributionRepository;
import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.domain.Goal;
import com.moneywise.goals.domain.ThermometerCalculator;
import com.moneywise.groups.application.GroupAuthorizationService;
import com.moneywise.shared.money.Money;


public class ListGoals {

    private final GoalRepository goals;
    private final ContributionRepository contributions;
    private final GroupAuthorizationService authorization;
    private final Clock clock;

    public ListGoals(GoalRepository goals, ContributionRepository contributions,
            GroupAuthorizationService authorization, Clock clock) {
        this.goals = goals;
        this.contributions = contributions;
        this.authorization = authorization;
        this.clock = clock;
    }

    public List<GoalSummary> execute(UUID userId, UUID groupId, boolean archived) {
        List<Goal> found;
        if (groupId == null) {
            found = goals.findByMemberAndArchived(userId, archived);
        } else {
            authorization.requireMember(groupId, userId);
            found = goals.findByGroupIdAndArchived(groupId, archived);
        }

        Map<UUID, Money> balances = contributions.balancesOf(found);
        return found.stream()
                .map(goal -> new GoalSummary(goal,
                        ThermometerCalculator.calculate(goal, balances.get(goal.getId()), clock)))
                .toList();
    }
}