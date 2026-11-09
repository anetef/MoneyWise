package com.moneywise.goals.infrastructure.persistence;

import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.moneywise.goals.application.port.ContributionRepository;
import com.moneywise.goals.domain.Contribution;
import com.moneywise.goals.domain.Goal;
import com.moneywise.goals.domain.MemberTotal;
import com.moneywise.shared.money.Money;

@Repository
public class JpaContributionRepository implements ContributionRepository {

    private final SpringDataContributionRepository contributions;

    public JpaContributionRepository(SpringDataContributionRepository contributions) {
        this.contributions = contributions;
    }

    @Override
    @Transactional
    public Contribution save(Contribution contribution) {
        contributions.save(GoalMapper.toEntity(contribution));
        return contribution;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Contribution> findByGoal(Goal goal) {
        return contributions.findByGoalIdOrderByCreatedAtAscIdAsc(goal.getId()).stream()
                .map(entity -> GoalMapper.toDomain(entity, goal.getCurrency()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Money balanceOf(Goal goal) {
        return new Money(contributions.sumBalance(goal.getId()), goal.getCurrency());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberTotal> totalsByMember(Goal goal) {
        return contributions.sumByMember(goal.getId()).stream()
                .map(row -> new MemberTotal(row.getUserId(), new Money(row.getTotal(), goal.getCurrency())))
                .toList();
    }
}