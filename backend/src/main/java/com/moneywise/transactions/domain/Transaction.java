package com.moneywise.transactions.domain;

import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.money.Money;

/** Transação financeira. O id é recebido do cliente e os dados pertencem a um usuário. */
public final class Transaction {

    private final UUID id;
    private final UUID userId;
    private final Money amount;
    private final LocalDate date;
    private final Category category;
    private final TransactionType type;
    private final String description;

    private Transaction(UUID id, UUID userId, Money amount, LocalDate date, Category category,
            TransactionType type, String description) {
        this.id = Objects.requireNonNull(id, "O id da transação é obrigatório.");
        this.userId = Objects.requireNonNull(userId, "O usuário da transação é obrigatório.");
        this.amount = Objects.requireNonNull(amount, "O valor da transação é obrigatório.");
        if (amount.amount().signum() <= 0) {
            throw new BusinessRuleException("INVALID_TRANSACTION_AMOUNT", "O valor deve ser maior que zero.");
        }
        this.date = Objects.requireNonNull(date, "A data da transação é obrigatória.");
        this.category = Objects.requireNonNull(category, "A categoria da transação é obrigatória.");
        this.type = Objects.requireNonNull(type, "O tipo da transação é obrigatório.");
        this.description = description == null || description.isBlank() ? null : description.strip();
    }

    public static Transaction create(UUID id, UUID userId, Money amount, LocalDate date, Category category,
            TransactionType type) {
        return create(id, userId, amount, date, category, type, null);
    }

    public static Transaction create(UUID id, UUID userId, Money amount, LocalDate date, Category category,
            TransactionType type, String description) {
        return new Transaction(id, userId, amount, date, category, type, description);
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public Money getAmount() {
        return amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public Category getCategory() {
        return category;
    }

    public TransactionType getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public boolean equals(Object other) {
        return this == other || other instanceof Transaction transaction && id.equals(transaction.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
