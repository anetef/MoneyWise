package com.moneywise.goals.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface SpringDataGoalRepository extends Repository<GoalEntity, UUID> {

    GoalEntity save(GoalEntity entity);

    Optional<GoalEntity> findById(UUID id);

    List<GoalEntity> findByGroupIdOrderByCreatedAtAscIdAsc(UUID groupId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT g FROM GoalEntity g WHERE g.id = :id")
    Optional<GoalEntity> findByIdForUpdate(@Param("id") UUID id);
}