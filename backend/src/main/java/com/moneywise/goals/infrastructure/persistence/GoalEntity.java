package com.moneywise.goals.infrastructure.persistence;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "goals")
public class GoalEntity {

    @Id
    private UUID id;

    @Column(name = "group_id", nullable = false)
    private UUID groupId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "target_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal targetAmount;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(nullable = false, length = 3)
    private String currency;

    private LocalDate deadline;

    @Column(length = 50)
    private String icon;

    @Column(length = 50)
    private String category;

    @Column(name = "monthly_reminder", nullable = false)
    private boolean monthlyReminder;

    @Column(name = "milestones_enabled", nullable = false)
    private boolean milestonesEnabled;

    @Column(nullable = false)
    private boolean archived;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected GoalEntity() {
    }

    GoalEntity(UUID id, UUID groupId, String name, BigDecimal targetAmount, String currency, LocalDate deadline,
            String icon, String category, boolean monthlyReminder, boolean milestonesEnabled, boolean archived,
            Instant createdAt) {
        this.id = id;
        this.groupId = groupId;
        this.name = name;
        this.targetAmount = targetAmount;
        this.currency = currency;
        this.deadline = deadline;
        this.icon = icon;
        this.category = category;
        this.monthlyReminder = monthlyReminder;
        this.milestonesEnabled = milestonesEnabled;
        this.archived = archived;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getGroupId() { return groupId; }
    public String getName() { return name; }
    public BigDecimal getTargetAmount() { return targetAmount; }
    public String getCurrency() { return currency; }
    public LocalDate getDeadline() { return deadline; }
    public String getIcon() { return icon; }
    public String getCategory() { return category; }
    public boolean isMonthlyReminder() { return monthlyReminder; }
    public boolean isMilestonesEnabled() { return milestonesEnabled; }
    public boolean isArchived() { return archived; }
    public Instant getCreatedAt() { return createdAt; }
}
