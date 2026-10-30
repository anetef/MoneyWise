package com.moneywise.groups.infrastructure.persistence;

import com.moneywise.groups.domain.GroupInvitation;

final class GroupInvitationMapper {

    private GroupInvitationMapper() {
    }

    static GroupInvitation toDomain(GroupInvitationEntity entity) {
        return GroupInvitation.restore(entity.getId(), entity.getCode(), entity.getGroupId(), entity.getInvitedBy(),
                entity.getCreatedAt(), entity.getExpiresAt(), entity.getStatus());
    }

    static GroupInvitationEntity toEntity(GroupInvitation invitation) {
        return new GroupInvitationEntity(invitation.getId(), invitation.getCode(), invitation.getGroupId(),
                invitation.getInvitedBy(), invitation.getStatus(), invitation.getCreatedAt(),
                invitation.getExpiresAt());
    }
}
