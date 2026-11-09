package com.moneywise.goals.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Currency;
import java.util.Objects;
import java.util.UUID;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.money.Money;

public final class Goal {

    public static final String INVALID_NAME = "INVALID_GOAL_NAME";
    public static final String INVALID_TARGET = "INVALID_GOAL_TARGET";
    public static final String ARCHIVED = "GOAL_ARCHIVED";
    public static final String CURRENCY_MISMATCH = "GOAL_CURRENCY_MISMATCH";
    public static final String INSUFFICIENT_BALANCE = "GOAL_INSUFFICIENT_BALANCE";

    private final UUID id;
    private final UUID groupId;
    private final String name;
    private final Money target;
    private final LocalDate deadline;
    private final String icon;
    private final String category;
    private final boolean monthlyReminder;
    private final boolean milestonesEnabled;
    private final boolean archived;
    private final Instant createdAt;

    private Goal(UUID id, UUID groupId, String name, Money target, LocalDate deadline, String icon,
            String category, boolean monthlyReminder, boolean milestonesEnabled, boolean archived,
            Instant createdAt) {
        this.id = Objects.requireNonNull(id, "O id da meta é obrigatório.");
        this.groupId = Objects.requireNonNull(groupId, "O grupo da meta é obrigatório.");
        this.name = normalizeName(name);
        this.target = Objects.requireNonNull(target, "O valor da meta é obrigatório.");
        if (target.amount().signum() <= 0) {
            throw new BusinessRuleException(INVALID_TARGET, "O valor da meta deve ser maior que zero.");
        }
        this.deadline = deadline;
        this.icon = blankToNull(icon);
        this.category = blankToNull(category);
        this.monthlyReminder = monthlyReminder;
        this.milestonesEnabled = milestonesEnabled;
        this.archived = archived;
        this.createdAt = Objects.requireNonNull(createdAt, "A data de criação é obrigatória.");
    }

    public static Goal create(UUID id, UUID groupId, String name, Money target, LocalDate deadline, String icon,
            String category, boolean monthlyReminder, boolean milestonesEnabled, Instant createdAt) {
        return new Goal(id, groupId, name, target, deadline, icon, category, monthlyReminder, milestonesEnabled,
                false, createdAt);
    }

    public static Goal restore(UUID id, UUID groupId, String name, Money target, LocalDate deadline, String icon,
            String category, boolean monthlyReminder, boolean milestonesEnabled, boolean archived,
            Instant createdAt) {
        return new Goal(id, groupId, name, target, deadline, icon, category, monthlyReminder, milestonesEnabled,
                archived, createdAt);
    }

    public Money balanceOf(Collection<Contribution> contributions) {
        Money balance = Money.zero(getCurrency());
        for (Contribution contribution : contributions) {
            if (!contribution.getGoalId().equals(id)) {
                throw new IllegalArgumentException("Aporte de outra meta: " + contribution.getId());
            }
            balance = contribution.applyTo(balance);
        }
        return balance;
    }

    public Contribution registerContribution(UUID contributionId, UUID userId, ContributionType type, Money amount,
            Money currentBalance, Instant now) {
        if (archived) {
            throw new BusinessRuleException(ARCHIVED, "Não é possível movimentar uma meta arquivada.");
        }
        if (!amount.currency().equals(getCurrency())) {
            throw new BusinessRuleException(CURRENCY_MISMATCH, "O aporte deve estar na moeda da meta.");
        }
        if (type == ContributionType.RETIRADA && amount.isGreaterThan(currentBalance)) {
            throw new BusinessRuleException(INSUFFICIENT_BALANCE, "A retirada é maior que o valor acumulado.");
        }
        return Contribution.create(contributionId, id, userId, type, amount, now);
    }

    public boolean hasDeadline() {
        return deadline != null;
    }

    private static String normalizeName(String name) {
        String normalized = name == null ? "" : name.strip();
        if (normalized.isEmpty() || normalized.length() > 100) {
            throw new BusinessRuleException(INVALID_NAME, "O nome da meta deve ter entre 1 e 100 caracteres.");
        }
        return normalized;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }

    public UUID getId() { return id; }
    public UUID getGroupId() { return groupId; }
    public String getName() { return name; }
    public Money getTarget() { return target; }
    public Currency getCurrency() { return target.currency(); }
    public LocalDate getDeadline() { return deadline; }
    public String getIcon() { return icon; }
    public String getCategory() { return category; }
    public boolean isMonthlyReminder() { return monthlyReminder; }
    public boolean isMilestonesEnabled() { return milestonesEnabled; }
    public boolean isArchived() { return archived; }
    public Instant getCreatedAt() { return createdAt; }
}