package com.moneywise.groups.infrastructure.persistence;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

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
        members.deleteMembersNotIn(group.getId(),
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

    @Override
    @Transactional(readOnly = true)
    public List<Group> findAllByMemberId(UUID userId) {
        List<GroupEntity> entities = groups.findAllByMemberUserId(userId);
        if (entities.isEmpty()) {
            return List.of();
        }
        Map<UUID, List<GroupMemberEntity>> membersByGroup = members
                .findByGroupIdInOrderByJoinedAtAscUserIdAsc(entities.stream().map(GroupEntity::getId).toList())
                .stream()
                .collect(Collectors.groupingBy(GroupMemberEntity::getGroupId));
        return entities.stream()
                .map(entity -> GroupMapper.toDomain(entity, membersByGroup.getOrDefault(entity.getId(), List.of())))
                .toList();
    }
}
