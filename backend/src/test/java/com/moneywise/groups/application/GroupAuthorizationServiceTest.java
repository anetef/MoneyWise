package com.moneywise.groups.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.groups.application.port.GroupMemberRepository;
import com.moneywise.groups.domain.GroupMember;
import com.moneywise.groups.domain.Role;
import com.moneywise.shared.exception.ForbiddenOperationException;

class GroupAuthorizationServiceTest {

    @Test
    @DisplayName("Autoriza membro e Admin, mas nega usuário sem associação")
    void checksMemberAndAdminAccess() {
        UUID groupId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();
        GroupMemberRepository repository = new GroupMemberRepository() {
            @Override
            public Optional<GroupMember> findByGroupIdAndUserId(UUID requestedGroupId, UUID userId) {
                if (!groupId.equals(requestedGroupId)) return Optional.empty();
                if (adminId.equals(userId)) return Optional.of(new GroupMember(userId, Role.ADMIN, Instant.EPOCH));
                if (memberId.equals(userId)) return Optional.of(new GroupMember(userId, Role.MEMBER, Instant.EPOCH));
                return Optional.empty();
            }

            @Override public GroupMember save(UUID id, GroupMember member) { throw new UnsupportedOperationException(); }
            @Override public java.util.List<GroupMember> findByGroupId(UUID id) { throw new UnsupportedOperationException(); }
        };
        GroupAuthorizationService authorization = new GroupAuthorizationService(repository);

        assertThat(authorization.isMember(groupId, memberId)).isTrue();
        assertThat(authorization.isMember(groupId, UUID.randomUUID())).isFalse();
        assertThat(authorization.isAdmin(groupId, adminId)).isTrue();
        assertThat(authorization.isAdmin(groupId, memberId)).isFalse();
        assertThatThrownBy(() -> authorization.requireMember(groupId, UUID.randomUUID()))
                .isInstanceOf(ForbiddenOperationException.class);
        assertThatThrownBy(() -> authorization.requireAdmin(groupId, memberId))
                .isInstanceOf(ForbiddenOperationException.class);
    }
}
