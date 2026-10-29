package com.moneywise.groups.infrastructure.persistence;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.moneywise.groups.domain.GroupInvitationStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Representação JPA da tabela group_invitations. */
@Entity
@Table(name = "group_invitations")
public class GroupInvitationEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Column(name = "group_id", nullable = false)
    private UUID groupId;

    @Column(name = "invited_by", nullable = false)
    private UUID invitedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 9)
    private GroupInvitationStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    protected GroupInvitationEntity() {
    }

    GroupInvitationEntity(UUID id, String code, UUID groupId, UUID invitedBy, GroupInvitationStatus status,
            Instant createdAt, Instant expiresAt) {
        this.id = id;
        this.code = code;
        this.groupId = groupId;
        this.invitedBy = invitedBy;
        this.status = status;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public UUID getGroupId() { return groupId; }
    public UUID getInvitedBy() { return invitedBy; }
    public GroupInvitationStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Instant getExpiresAt() { return expiresAt; }
}
