package com.moneywise.goals.application.port;

import java.util.List;

import com.moneywise.goals.domain.Contribution;
import com.moneywise.goals.domain.Goal;
import com.moneywise.goals.domain.MemberTotal;
import com.moneywise.shared.money.Money;
import java.util.Optional;
import java.util.UUID;

public interface ContributionRepository {

    Contribution save(Contribution contribution);

    List<Contribution> findByGoal(Goal goal);

    Money balanceOf(Goal goal);

    List<MemberTotal> totalsByMember(Goal goal);

    Optional<UUID> findGoalIdByContributionId(UUID contributionId);
}
