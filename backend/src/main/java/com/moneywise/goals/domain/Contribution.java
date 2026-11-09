package com.moneywise.goals.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.money.Money;

public final class Contribution {

    public static final String INVALID_AMOUNT = "INVALID_CONTRIBUTION_AMOUNT";

    private final UUID id;
    private final UUID goalId;
    private final UUID userId;
    private final ContributionType type;
    private final Money amount;
    private final Instant createdAt;

    private Contribution(UUID id, UUID goalId, UUID userId, ContributionType type, Money amount,
            Instant createdAt) {
        this.id = Objects.requireNonNull(id, "O id do aporte é obrigatório.");
        this.goalId = Objects.requireNonNull(goalId, "A meta do aporte é obrigatória.");
        this.userId = userId;
        this.type = Objects.requireNonNull(type, "O tipo do aporte é obrigatório.");
        this.amount = Objects.requireNonNull(amount, "O valor do aporte é obrigatório.");
        if (amount.amount().signum() <= 0) {
            throw new BusinessRuleException(INVALID_AMOUNT, "O valor deve ser maior que zero.");
        }
        this.createdAt = Objects.requireNonNull(createdAt, "A data do aporte é obrigatória.");
    }

    static Contribution create(UUID id, UUID goalId, UUID userId, ContributionType type, Money amount,
            Instant createdAt) {
        Objects.requireNonNull(userId, "O autor do aporte é obrigatório.");
        return new Contribution(id, goalId, userId, type, amount, createdAt);
    }

    public static Contribution restore(UUID id, UUID goalId, UUID userId, ContributionType type, Money amount,
            Instant createdAt) {
        return new Contribution(id, goalId, userId, type, amount, createdAt);
    }

    Money applyTo(Money balance) {
        return type == ContributionType.ENTRADA ? balance.plus(amount) : balance.minus(amount);
    }

    public UUID getId() { return id; }
    public UUID getGoalId() { return goalId; }
    public UUID getUserId() { return userId; }
    public ContributionType getType() { return type; }
    public Money getAmount() { return amount; }
    public Instant getCreatedAt() { return createdAt; }
}