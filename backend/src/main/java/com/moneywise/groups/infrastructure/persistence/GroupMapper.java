package com.moneywise.groups.infrastructure.persistence;

import java.util.List;

import com.moneywise.groups.domain.Group;
import com.moneywise.groups.domain.GroupMember;

final class GroupMapper {

    private GroupMapper() {
    }

    static Group toDomain(GroupEntity entity, List<GroupMemberEntity> memberEntities) {
        List<GroupMember> members = memberEntities.stream()
                .map(member -> new GroupMember(member.getUserId(), member.getRole(), member.getJoinedAt()))
                .toList();
        return Group.restore(entity.getId(), entity.getName(), entity.getAdminId(), entity.getCreatedAt(), members);
    }

    static GroupEntity toEntity(Group group) {
        return new GroupEntity(group.getId(), group.getName(), group.getAdminId(), group.getCreatedAt());
    }

    static GroupMember toDomain(GroupMemberEntity entity) {
        return new GroupMember(entity.getUserId(), entity.getRole(), entity.getJoinedAt());
    }

    static GroupMemberEntity toEntity(java.util.UUID groupId, GroupMember member) {
        return new GroupMemberEntity(groupId, member.userId(), member.role(), member.joinedAt());
    }
}
