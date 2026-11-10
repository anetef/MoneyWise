package com.moneywise.goals.application.port;

import java.util.List;
import java.util.Map;

import com.moneywise.goals.domain.Contribution;
import com.moneywise.goals.domain.Goal;
import com.moneywise.goals.domain.MemberTotal;
import com.moneywise.shared.money.Money;
import java.util.Optional;
import java.util.UUID;
import java.util.Collection;

public interface ContributionRepository {

    Contribution save(Contribution contribution);

    List<Contribution> findByGoal(Goal goal);

    Money balanceOf(Goal goal);

    List<MemberTotal> totalsByMember(Goal goal);

    Optional<UUID> findGoalIdByContributionId(UUID contributionId);

    ContributionPage findHistory(Goal goal, int page, int size);

    Map<UUID, Money> balancesOf(Collection<Goal> goals);
}
