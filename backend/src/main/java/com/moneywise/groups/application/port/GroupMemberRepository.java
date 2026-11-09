package com.moneywise.groups.application.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.groups.domain.GroupMember;

/** Consultas e gravação de membros, sempre vinculadas a um grupo. */
public interface GroupMemberRepository {

    GroupMember save(UUID groupId, GroupMember member);

    List<GroupMember> findByGroupId(UUID groupId);

    Optional<GroupMember> findByGroupIdAndUserId(UUID groupId, UUID userId);
}
