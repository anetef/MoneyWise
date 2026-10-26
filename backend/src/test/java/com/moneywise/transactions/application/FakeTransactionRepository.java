package com.moneywise.transactions.application;

import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.Currency;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.application.port.TransactionAggregate;
import com.moneywise.transactions.application.port.TransactionPage;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.Transaction;
import com.moneywise.transactions.domain.TransactionType;

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
    public TransactionPage findPageByUserIdAndFilters(UUID userId, Category category, LocalDate from, LocalDate to,
            int page, int size) {
        List<Transaction> filtered = transactions.values().stream()
                .filter(transaction -> transaction.getUserId().equals(userId))
                .filter(transaction -> category == null || transaction.getCategory().equals(category))
                .filter(transaction -> from == null || !transaction.getDate().isBefore(from))
                .filter(transaction -> to == null || !transaction.getDate().isAfter(to))
                .sorted(Comparator.comparing(Transaction::getDate).reversed()
                        .thenComparing(Transaction::getId, Comparator.reverseOrder()))
                .toList();
        long offset = (long) page * size;
        int start = (int) Math.min(offset, filtered.size());
        int end = Math.min(start + size, filtered.size());
        int totalPages = (int) Math.ceil((double) filtered.size() / size);
        return new TransactionPage(filtered.subList(start, end), page, size, filtered.size(), totalPages,
                page + 1 < totalPages);
    }

    @Override
    public List<TransactionAggregate> findMonthlyAggregatesByUserIdAndPeriod(UUID userId, LocalDate fromInclusive,
            LocalDate toExclusive) {
        record Key(TransactionType type, String category) {
        }
        Map<Key, BigDecimal> totals = new LinkedHashMap<>();
        transactions.values().stream()
                .filter(transaction -> transaction.getUserId().equals(userId))
                .filter(transaction -> !transaction.getDate().isBefore(fromInclusive)
                        && transaction.getDate().isBefore(toExclusive))
                .forEach(transaction -> totals.merge(
                        new Key(transaction.getType(), transaction.getType() == TransactionType.EXPENSE
                                ? transaction.getCategory().name() : null),
                        transaction.getAmount().amount(), BigDecimal::add));
        return totals.entrySet().stream()
                .map(entry -> new TransactionAggregate(entry.getKey().type(), entry.getKey().category(),
                        entry.getValue()))
                .toList();
    }
}
