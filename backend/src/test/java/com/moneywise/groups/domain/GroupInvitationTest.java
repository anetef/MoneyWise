package com.moneywise.groups.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.shared.exception.BusinessRuleException;

class GroupInvitationTest {

    private static final Instant CREATED_AT = Instant.parse("2026-01-01T10:00:00Z");

    @Test
    @DisplayName("Calcula a validade do convite no domínio por sete dias")
    void calculatesExpiryInDomain() {
        GroupInvitation invitation = newInvitation();

        assertThat(invitation.getExpiresAt()).isEqualTo(CREATED_AT.plus(7, ChronoUnit.DAYS));
        assertThat(invitation.getStatus()).isEqualTo(GroupInvitationStatus.PENDING);
        assertThat(invitation.isExpired(invitation.getExpiresAt().minusNanos(1))).isFalse();
        assertThat(invitation.isExpired(invitation.getExpiresAt())).isTrue();
    }

    @Test
    @DisplayName("Aceita convite pendente dentro da validade e rejeita convite expirado")
    void acceptsOnlyPendingNonExpiredInvitation() {
        GroupInvitation invitation = newInvitation();

        GroupInvitation accepted = invitation.accept(invitation.getExpiresAt().minusNanos(1));

        assertThat(accepted.getStatus()).isEqualTo(GroupInvitationStatus.ACCEPTED);
        assertThat(accepted.getExpiresAt()).isEqualTo(invitation.getExpiresAt());
        assertThatThrownBy(() -> invitation.accept(invitation.getExpiresAt()))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", "GROUP_INVITATION_EXPIRED");
        assertThatThrownBy(() -> accepted.accept(CREATED_AT.plusSeconds(1)))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", "GROUP_INVITATION_NOT_PENDING");
    }

    private GroupInvitation newInvitation() {
        return GroupInvitation.create(UUID.randomUUID(), "convite-123", UUID.randomUUID(), UUID.randomUUID(),
                CREATED_AT);
    }
}
