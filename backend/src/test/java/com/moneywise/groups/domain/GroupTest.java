package com.moneywise.groups.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ForbiddenOperationException;

class GroupTest {

    private static final Instant CREATED_AT = Instant.parse("2026-01-01T10:00:00Z");

    @Test
    @DisplayName("Grupo começa com o criador como único Admin")
    void createsGroupWithAdminMember() {
        UUID adminId = UUID.randomUUID();

        Group group = Group.create(UUID.randomUUID(), "  Família  ", adminId, CREATED_AT);

        assertThat(group.getName()).isEqualTo("Família");
        assertThat(group.getAdminId()).isEqualTo(adminId);
        assertThat(group.isMember(adminId)).isTrue();
        assertThat(group.isAdmin(adminId)).isTrue();
        assertThat(group.getMembers()).singleElement().extracting(GroupMember::role).isEqualTo(Role.ADMIN);
    }

    @Test
    @DisplayName("Identifica membros, não membros e papel de Admin")
    void checksMembershipAndRole() {
        UUID adminId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();
        Group group = Group.create(UUID.randomUUID(), "Casa", adminId, CREATED_AT)
                .addMember(memberId, CREATED_AT.plusSeconds(1));

        assertThat(group.isMember(adminId)).isTrue();
        assertThat(group.isMember(memberId)).isTrue();
        assertThat(group.isMember(UUID.randomUUID())).isFalse();
        assertThat(group.isAdmin(adminId)).isTrue();
        assertThat(group.isAdmin(memberId)).isFalse();
    }

    @Test
    @DisplayName("Somente Admin pode alterar o valor da meta ou remover membro")
    void restrictsAdminOperations() {
        UUID adminId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();
        Group group = Group.create(UUID.randomUUID(), "Casa", adminId, CREATED_AT)
                .addMember(memberId, CREATED_AT.plusSeconds(1));

        assertThatThrownBy(() -> group.ensureCanChangeGoalTarget(memberId))
                .isInstanceOf(ForbiddenOperationException.class)
                .hasFieldOrPropertyWithValue("code", "GROUP_ADMIN_REQUIRED");
        assertThatThrownBy(() -> group.removeMember(memberId, adminId))
                .isInstanceOf(ForbiddenOperationException.class);
        assertThat(group.removeMember(adminId, memberId).getMembers())
                .extracting(GroupMember::userId).containsExactly(adminId);
    }

    @Test
    @DisplayName("Ao Admin sair, promove o membro mais antigo")
    void promotesOldestMemberWhenAdminLeaves() {
        UUID adminId = UUID.randomUUID();
        UUID oldestId = UUID.randomUUID();
        UUID newerId = UUID.randomUUID();
        Group group = Group.create(UUID.randomUUID(), "Casa", adminId, CREATED_AT)
                .addMember(newerId, CREATED_AT.plusSeconds(20))
                .addMember(oldestId, CREATED_AT.plusSeconds(10));

        Group afterAdminLeaves = group.removeMember(adminId, adminId);

        assertThat(afterAdminLeaves.getAdminId()).isEqualTo(oldestId);
        assertThat(afterAdminLeaves.findMember(newerId)).get().extracting(GroupMember::role).isEqualTo(Role.MEMBER);
        assertThat(afterAdminLeaves.isMember(adminId)).isFalse();
    }

    @Test
    @DisplayName("Não permite duplicar membro nem deixar grupo sem Admin")
    void preservesMembershipInvariants() {
        UUID adminId = UUID.randomUUID();
        Group group = Group.create(UUID.randomUUID(), "Casa", adminId, CREATED_AT);

        assertThatThrownBy(() -> group.addMember(adminId, CREATED_AT.plusSeconds(1)))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", "GROUP_MEMBER_ALREADY_EXISTS");
        assertThatThrownBy(() -> group.removeMember(adminId, adminId))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", "GROUP_LAST_MEMBER_CANNOT_LEAVE");
        assertThat(group.getAdminId()).isEqualTo(adminId);
    }
}
