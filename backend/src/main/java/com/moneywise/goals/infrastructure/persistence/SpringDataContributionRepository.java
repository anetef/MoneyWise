package com.moneywise.goals.infrastructure.persistence;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface SpringDataContributionRepository extends Repository<ContributionEntity, UUID> {

    ContributionEntity save(ContributionEntity entity);

    List<ContributionEntity> findByGoalIdOrderByCreatedAtAscIdAsc(UUID goalId);

    @Query(value = """
            SELECT COALESCE(SUM(CASE WHEN type = 'ENTRADA' THEN amount ELSE -amount END), 0)
              FROM contributions
             WHERE goal_id = :goalId
            """, nativeQuery = true)
    BigDecimal sumBalance(@Param("goalId") UUID goalId);

    @Query(value = """
            SELECT user_id AS "userId",
                   SUM(CASE WHEN type = 'ENTRADA' THEN amount ELSE -amount END) AS "total"
              FROM contributions
             WHERE goal_id = :goalId
             GROUP BY user_id
             ORDER BY "total" DESC
            """, nativeQuery = true)
    List<MemberTotalRow> sumByMember(@Param("goalId") UUID goalId);

    @Query("SELECT c.goalId FROM ContributionEntity c WHERE c.id = :id")
    Optional<UUID> findGoalIdById(@Param("id") UUID id);
}