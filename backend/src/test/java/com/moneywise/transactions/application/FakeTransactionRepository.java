package com.moneywise.transactions.application;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Currency;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.Transaction;

/** Small in-memory adapter for isolated transaction use-case tests. */
final class FakeTransactionRepository implements TransactionRepository {

    final Map<UUID, Transaction> transactions = new HashMap<>();
    Currency currency = Currency.getInstance("BRL");
    int saves;
    int updates;
    int deletes;

    @Override
    public Transaction save(Transaction transaction) {
        saves++;
        transactions.put(transaction.getId(), transaction);
        return transaction;
    }

    @Override
    public Transaction update(Transaction transaction, Instant expectedUpdatedAt) {
        Transaction current = transactions.get(transaction.getId());
        if (current == null || !java.util.Objects.equals(current.getUpdatedAt(), expectedUpdatedAt)) {
            return current;
        }
        updates++;
        transactions.put(transaction.getId(), transaction);
        return transaction;
    }

    @Override
    public boolean deleteByIdAndUserId(UUID id, UUID userId) {
        Transaction current = transactions.get(id);
        if (current == null || !current.getUserId().equals(userId)) {
            return false;
        }
        deletes++;
        transactions.remove(id);
        return true;
    }

    @Override
    public Currency findCurrencyByUserId(UUID userId) {
        return currency;
    }

    @Override
    public Optional<Transaction> findByIdAndUserId(UUID id, UUID userId) {
        return Optional.ofNullable(transactions.get(id)).filter(transaction -> transaction.getUserId().equals(userId));
    }

    @Override
    public List<Transaction> findByUserIdAndFilters(UUID userId, Category category, LocalDate from, LocalDate to) {
        throw new UnsupportedOperationException("Not used by transaction use-case tests.");
    }
}
