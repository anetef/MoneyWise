package com.moneywise.goals.infrastructure.persistence;

import java.util.Currency;

import com.moneywise.goals.domain.Contribution;
import com.moneywise.goals.domain.Goal;
import com.moneywise.shared.money.Money;

final class GoalMapper {

    private GoalMapper() {
    }

    static GoalEntity toEntity(Goal goal) {
        return new GoalEntity(goal.getId(), goal.getGroupId(), goal.getName(), goal.getTarget().amount(),
                goal.getCurrency().getCurrencyCode(), goal.getDeadline(), goal.getIcon(), goal.getCategory(),
                goal.isMonthlyReminder(), goal.isMilestonesEnabled(), goal.isArchived(), goal.getCreatedAt());
    }

    static Goal toDomain(GoalEntity entity) {
        Money target = new Money(entity.getTargetAmount(), Currency.getInstance(entity.getCurrency().strip()));
        return Goal.restore(entity.getId(), entity.getGroupId(), entity.getName(), target, entity.getDeadline(),
                entity.getIcon(), entity.getCategory(), entity.isMonthlyReminder(), entity.isMilestonesEnabled(),
                entity.isArchived(), entity.getCreatedAt());
    }

    static ContributionEntity toEntity(Contribution contribution) {
        return new ContributionEntity(contribution.getId(), contribution.getGoalId(), contribution.getUserId(),
                contribution.getType(), contribution.getAmount().amount(), contribution.getCreatedAt());
    }

    static Contribution toDomain(ContributionEntity entity, Currency currency) {
        return Contribution.restore(entity.getId(), entity.getGoalId(), entity.getUserId(), entity.getType(),
                new Money(entity.getAmount(), currency), entity.getCreatedAt());
    }
}