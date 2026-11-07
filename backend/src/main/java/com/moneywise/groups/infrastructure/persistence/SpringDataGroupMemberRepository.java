package com.moneywise.groups.infrastructure.persistence;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.Repository;

/** Consultas JPA de membros sempre delimitadas pelo grupo. */
public interface SpringDataGroupMemberRepository extends Repository<GroupMemberEntity, GroupMemberId> {

    GroupMemberEntity save(GroupMemberEntity entity);

    @Modifying
    @Query("delete from GroupMemberEntity m where m.groupId = :groupId and m.userId not in :userIds")
    int deleteMembersNotIn(@Param("groupId") UUID groupId, @Param("userIds") Collection<UUID> userIds);

    List<GroupMemberEntity> findByGroupIdOrderByJoinedAtAscUserIdAsc(UUID groupId);

    List<GroupMemberEntity> findByGroupIdInOrderByJoinedAtAscUserIdAsc(Collection<UUID> groupIds);

    Optional<GroupMemberEntity> findByGroupIdAndUserId(UUID groupId, UUID userId);

    /** Insere o membro sem nunca sobrescrever uma participação existente (nem o papel de Admin). */
    @Modifying
    @Query(value = """
            insert into group_members (group_id, user_id, role, joined_at, created_at, updated_at)
            values (:groupId, :userId, :role, :joinedAt, :joinedAt, :joinedAt)
            on conflict (group_id, user_id) do nothing
            """, nativeQuery = true)
    int insertIfAbsent(@Param("groupId") UUID groupId, @Param("userId") UUID userId, @Param("role") String role,
            @Param("joinedAt") Instant joinedAt);
}
