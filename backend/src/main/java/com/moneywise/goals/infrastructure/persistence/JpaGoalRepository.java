package com.moneywise.goals.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.domain.Goal;
import org.springframework.transaction.annotation.Propagation;

@Repository
public class JpaGoalRepository implements GoalRepository {

    private final SpringDataGoalRepository goals;

    public JpaGoalRepository(SpringDataGoalRepository goals) {
        this.goals = goals;
    }

    @Override
    @Transactional
    public Goal save(Goal goal) {
        return GoalMapper.toDomain(goals.save(GoalMapper.toEntity(goal)));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Goal> findById(UUID id) {
        return goals.findById(id).map(GoalMapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Goal> findByGroupId(UUID groupId) {
        return goals.findByGroupIdOrderByCreatedAtAscIdAsc(groupId).stream().map(GoalMapper::toDomain).toList();
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public Optional<Goal> findByIdForUpdate(UUID id) {
        return goals.findByIdForUpdate(id).map(GoalMapper::toDomain);
    }

   
}