package com.moneywise.groups.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Collection;

import org.springframework.data.repository.Repository;

/** Consultas JPA de membros sempre delimitadas pelo grupo. */
public interface SpringDataGroupMemberRepository extends Repository<GroupMemberEntity, GroupMemberId> {

    GroupMemberEntity save(GroupMemberEntity entity);

    void deleteByGroupIdAndUserIdNotIn(UUID groupId, Collection<UUID> userIds);

    List<GroupMemberEntity> findByGroupIdOrderByJoinedAtAscUserIdAsc(UUID groupId);

    Optional<GroupMemberEntity> findByGroupIdAndUserId(UUID groupId, UUID userId);
}
