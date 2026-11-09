package com.moneywise.goals.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.Repository;

public interface SpringDataGoalRepository extends Repository<GoalEntity, UUID> {

    GoalEntity save(GoalEntity entity);

    Optional<GoalEntity> findById(UUID id);

    List<GoalEntity> findByGroupIdOrderByCreatedAtAscIdAsc(UUID groupId);
}