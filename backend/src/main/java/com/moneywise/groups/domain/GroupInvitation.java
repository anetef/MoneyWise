package com.moneywise.groups.domain;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.moneywise.shared.exception.BusinessRuleException;

/** Convite de grupo. A validade é calculada pela aplicação, não pelo banco. */
public final class GroupInvitation {

    private static final Duration VALIDITY = Duration.ofDays(7);

    private final UUID id;
    private final String code;
    private final UUID groupId;
    private final UUID invitedBy;
    private final Instant createdAt;
    private final Instant expiresAt;
    private final GroupInvitationStatus status;

    private GroupInvitation(UUID id, String code, UUID groupId, UUID invitedBy, Instant createdAt,
            Instant expiresAt, GroupInvitationStatus status) {
        this.id = Objects.requireNonNull(id, "id não pode ser nulo");
        this.code = Objects.requireNonNull(code, "code não pode ser nulo");
        this.groupId = Objects.requireNonNull(groupId, "groupId não pode ser nulo");
        this.invitedBy = Objects.requireNonNull(invitedBy, "invitedBy não pode ser nulo");
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt não pode ser nulo");
        this.expiresAt = Objects.requireNonNull(expiresAt, "expiresAt não pode ser nulo");
        this.status = Objects.requireNonNull(status, "status não pode ser nulo");
        if (!expiresAt.isAfter(createdAt)) {
            throw new IllegalArgumentException("expiresAt precisa ser posterior a createdAt.");
        }
    }

    public static GroupInvitation create(UUID id, String code, UUID groupId, UUID invitedBy, Instant createdAt) {
        Objects.requireNonNull(createdAt, "createdAt não pode ser nulo");
        return new GroupInvitation(id, code, groupId, invitedBy, createdAt, createdAt.plus(VALIDITY),
                GroupInvitationStatus.PENDING);
    }

    public static GroupInvitation restore(UUID id, String code, UUID groupId, UUID invitedBy, Instant createdAt,
            Instant expiresAt, GroupInvitationStatus status) {
        return new GroupInvitation(id, code, groupId, invitedBy, createdAt, expiresAt, status);
    }

    public boolean isExpired(Instant now) {
        return !Objects.requireNonNull(now, "now não pode ser nulo").isBefore(expiresAt);
    }

    public GroupInvitation accept(Instant now) {
        if (status != GroupInvitationStatus.PENDING) {
            throw new BusinessRuleException("GROUP_INVITATION_NOT_PENDING", "Este convite não está pendente.");
        }
        if (isExpired(now)) {
            throw new BusinessRuleException("GROUP_INVITATION_EXPIRED", "Este convite expirou.");
        }
        return new GroupInvitation(id, code, groupId, invitedBy, createdAt, expiresAt,
                GroupInvitationStatus.ACCEPTED);
    }

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public UUID getGroupId() { return groupId; }
    public UUID getInvitedBy() { return invitedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public GroupInvitationStatus getStatus() { return status; }
}
