package com.moneywise.groups.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Collection;

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

    Optional<GroupMemberEntity> findByGroupIdAndUserId(UUID groupId, UUID userId);
}
