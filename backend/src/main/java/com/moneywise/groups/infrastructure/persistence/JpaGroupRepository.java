package com.moneywise.groups.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.domain.Group;

/** Implementa o port de grupos usando PostgreSQL/JPA. */
@Repository
public class JpaGroupRepository implements GroupRepository {

    private final SpringDataGroupRepository groups;
    private final SpringDataGroupMemberRepository members;

    public JpaGroupRepository(SpringDataGroupRepository groups, SpringDataGroupMemberRepository members) {
        this.groups = groups;
        this.members = members;
    }

    @Override
    @Transactional
    public Group save(Group group) {
        GroupEntity saved = groups.save(GroupMapper.toEntity(group));
        members.deleteByGroupIdAndUserIdNotIn(group.getId(),
                group.getMembers().stream().map(member -> member.userId()).toList());
        for (var member : group.getMembers()) {
            members.save(GroupMapper.toEntity(group.getId(), member));
        }
        return findById(saved.getId()).orElseThrow();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Group> findById(UUID id) {
        return groups.findById(id)
                .map(entity -> GroupMapper.toDomain(entity, members.findByGroupIdOrderByJoinedAtAscUserIdAsc(id)));
    }
}
