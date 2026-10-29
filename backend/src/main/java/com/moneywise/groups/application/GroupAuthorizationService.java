package com.moneywise.groups.application;

import java.util.UUID;

import com.moneywise.groups.application.port.GroupMemberRepository;
import com.moneywise.groups.domain.Role;
import com.moneywise.shared.exception.ResourceNotFoundException;
import com.moneywise.shared.exception.ForbiddenOperationException;

/** Autorização compartilhada pelas operações de grupos e metas (arquitetura, seção 6.3). */
public final class GroupAuthorizationService {

    private final GroupMemberRepository members;

    public GroupAuthorizationService(GroupMemberRepository members) {
        this.members = members;
    }

    public boolean isMember(UUID groupId, UUID userId) {
        return members.findByGroupIdAndUserId(groupId, userId).isPresent();
    }

    public boolean isAdmin(UUID groupId, UUID userId) {
        return members.findByGroupIdAndUserId(groupId, userId)
                .map(member -> member.role() == Role.ADMIN)
                .orElse(false);
    }

    public void requireMember(UUID groupId, UUID userId) {
        if (!isMember(groupId, userId)) {
            throw new ResourceNotFoundException("Grupo não encontrado.");
        }
    }

    public void requireAdmin(UUID groupId, UUID userId) {
        requireMember(groupId, userId);
        if (!isAdmin(groupId, userId)) {
            throw new ForbiddenOperationException("GROUP_ADMIN_REQUIRED",
                    "Somente o Admin pode realizar esta operação.");
        }
    }
}
