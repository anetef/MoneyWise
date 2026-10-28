package com.moneywise.groups.infrastructure.persistence;

import java.time.Instant;
import java.util.UUID;

import com.moneywise.groups.domain.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

/** Representação JPA da associação entre grupo e usuário. */
@Entity
@Table(name = "group_members")
@IdClass(GroupMemberId.class)
public class GroupMemberEntity {

    @Id
    @Column(name = "group_id", nullable = false)
    private UUID groupId;

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 6)
    private Role role;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;

    protected GroupMemberEntity() {
    }

    GroupMemberEntity(UUID groupId, UUID userId, Role role, Instant joinedAt) {
        this.groupId = groupId;
        this.userId = userId;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public UUID getGroupId() { return groupId; }
    public UUID getUserId() { return userId; }
    public Role getRole() { return role; }
    public Instant getJoinedAt() { return joinedAt; }
}
