package com.moneywise.goals.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface SpringDataGoalRepository extends Repository<GoalEntity, UUID> {

    GoalEntity save(GoalEntity entity);

    Optional<GoalEntity> findById(UUID id);

    List<GoalEntity> findByGroupIdOrderByCreatedAtAscIdAsc(UUID groupId);

    List<GoalEntity> findByGroupIdAndArchivedOrderByCreatedAtAscIdAsc(UUID groupId, boolean archived);

    @Query(value = """
            SELECT g.*
              FROM goals g
              JOIN group_members m ON m.group_id = g.group_id
             WHERE m.user_id = :userId
               AND g.archived = :archived
             ORDER BY g.created_at, g.id
            """, nativeQuery = true)
    List<GoalEntity> findByMemberAndArchived(@Param("userId") UUID userId, @Param("archived") boolean archived);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT g FROM GoalEntity g WHERE g.id = :id")
    Optional<GoalEntity> findByIdForUpdate(@Param("id") UUID id);

    void deleteById(UUID id);
}