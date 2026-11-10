package com.moneywise.goals.infrastructure.persistence;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.moneywise.goals.application.port.ContributionPage;
import com.moneywise.goals.application.port.ContributionRepository;
import com.moneywise.goals.domain.Contribution;
import com.moneywise.goals.domain.Goal;
import com.moneywise.goals.domain.MemberTotal;
import com.moneywise.shared.money.Money;

import jakarta.persistence.EntityManager;

@Repository
public class JpaContributionRepository implements ContributionRepository {

    private final SpringDataContributionRepository contributions;
    private final EntityManager entityManager;

    public JpaContributionRepository(SpringDataContributionRepository contributions, EntityManager entityManager) {
        this.contributions = contributions;
        this.entityManager = entityManager;
    }

    /**
     * Grava o movimento e envia o INSERT ao banco na hora (flush), para que as somas calculadas
     * logo em seguida, na mesma transação, já incluam este movimento.
     */
    @Override
    @Transactional
    public Contribution save(Contribution contribution) {
        contributions.save(GoalMapper.toEntity(contribution));
        entityManager.flush();
        return contribution;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UUID> findGoalIdByContributionId(UUID contributionId) {
        return contributions.findGoalIdById(contributionId);
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

        @Override
    @Transactional(readOnly = true)
    public ContributionPage findHistory(Goal goal, int page, int size) {
        var result = contributions.findByGoalIdOrderByCreatedAtDescIdDesc(goal.getId(), PageRequest.of(page, size));
        return new ContributionPage(
                result.getContent().stream().map(entity -> GoalMapper.toDomain(entity, goal.getCurrency())).toList(),
                page, size, result.getTotalElements(), result.getTotalPages(), result.hasNext());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<UUID, Money> balancesOf(Collection<Goal> goals) {
        Map<UUID, Goal> goalsById = new HashMap<>();
        Map<UUID, Money> balances = new HashMap<>();
        for (Goal goal : goals) {
            goalsById.put(goal.getId(), goal);
            balances.put(goal.getId(), Money.zero(goal.getCurrency()));
        }
        if (goalsById.isEmpty()) {
            return balances;
        }
        for (GoalBalanceRow row : contributions.sumBalanceByGoalIds(goalsById.keySet())) {
            balances.put(row.getGoalId(), new Money(row.getTotal(), goalsById.get(row.getGoalId()).getCurrency()));
        }
        return balances;
    }
}