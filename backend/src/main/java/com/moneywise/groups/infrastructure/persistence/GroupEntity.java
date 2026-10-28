package com.moneywise.groups.infrastructure.persistence;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Representação JPA da tabela groups. */
@Entity
@Table(name = "groups")
public class GroupEntity {

    @Id
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "admin_id", nullable = false)
    private UUID adminId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected GroupEntity() {
    }

    GroupEntity(UUID id, String name, UUID adminId, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.adminId = adminId;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public UUID getAdminId() { return adminId; }
    public Instant getCreatedAt() { return createdAt; }
}
