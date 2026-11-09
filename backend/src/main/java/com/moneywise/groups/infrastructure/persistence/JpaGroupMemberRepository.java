package com.moneywise.groups.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.moneywise.groups.application.port.GroupMemberRepository;
import com.moneywise.groups.domain.GroupMember;

/** Implementa as consultas e gravação de membros filtradas por grupo. */
@Repository
public class JpaGroupMemberRepository implements GroupMemberRepository {

    private final SpringDataGroupMemberRepository springData;

    public JpaGroupMemberRepository(SpringDataGroupMemberRepository springData) {
        this.springData = springData;
    }

    @Override
    @Transactional
    public GroupMember save(UUID groupId, GroupMember member) {
        return GroupMapper.toDomain(springData.save(GroupMapper.toEntity(groupId, member)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupMember> findByGroupId(UUID groupId) {
        return springData.findByGroupIdOrderByJoinedAtAscUserIdAsc(groupId).stream()
                .map(GroupMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GroupMember> findByGroupIdAndUserId(UUID groupId, UUID userId) {
        return springData.findByGroupIdAndUserId(groupId, userId).map(GroupMapper::toDomain);
    }
}
