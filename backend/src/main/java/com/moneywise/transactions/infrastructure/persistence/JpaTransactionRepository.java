package com.moneywise.transactions.infrastructure.persistence;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Currency;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.moneywise.shared.exception.ResourceNotFoundException;
import com.moneywise.transactions.application.port.TransactionAggregate;
import com.moneywise.transactions.application.port.TransactionPage;
import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.Transaction;
import com.moneywise.transactions.domain.TransactionType;

import jakarta.persistence.EntityManager;

/** Implementa o port de transações usando Spring Data JPA. */
@Repository
public class JpaTransactionRepository implements TransactionRepository {

    private final SpringDataTransactionRepository springData;
    private final EntityManager entityManager;

    public JpaTransactionRepository(SpringDataTransactionRepository springData, EntityManager entityManager) {
        this.springData = springData;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public Transaction save(Transaction transaction) {
        springData.findUserIdById(transaction.getId()).ifPresent(ownerId -> {
            if (!ownerId.equals(transaction.getUserId())) {
                throw new ResourceNotFoundException("Transação não encontrada.");
            }
        });
        springData.save(TransactionMapper.toEntity(transaction));
        entityManager.flush();
        return findByIdAndUserId(transaction.getId(), transaction.getUserId()).orElseThrow(
                () -> new ResourceNotFoundException("Transação não encontrada."));
    }

    @Override
    @Transactional
    public Transaction update(Transaction transaction, Instant expectedUpdatedAt) {
        springData.updateIfCurrent(transaction.getId(), transaction.getUserId(),
                transaction.getAmount().amount(), transaction.getDate(), transaction.getCategory().name(),
                transaction.getType().name(), transaction.getDescription(), expectedUpdatedAt);
        return findByIdAndUserId(transaction.getId(), transaction.getUserId()).orElseThrow(
                () -> new ResourceNotFoundException("Transação não encontrada."));
    }

    @Override
    @Transactional
    public boolean deleteByIdAndUserId(UUID id, UUID userId) {
        return springData.deleteByIdAndUserId(id, userId) > 0;
    }

    @Override
    public Currency findCurrencyByUserId(UUID userId) {
        return springData.findCurrencyByUserId(userId).map(Currency::getInstance)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    }

    @Override
    public Optional<Transaction> findByIdAndUserId(UUID id, UUID userId) {
        return springData.findRowByIdAndUserId(id, userId).map(TransactionMapper::toDomain);
    }

    @Override
    public TransactionPage findPageByUserIdAndFilters(UUID userId, Category category, LocalDate from, LocalDate to,
            int page, int size) {
        String categoryName = category == null ? null : category.name();
        var result = springData.findPageRowsByUserIdAndFilters(userId, categoryName, from, to,
                PageRequest.of(page, size));
        return new TransactionPage(result.getContent().stream().map(TransactionMapper::toDomain).toList(), page, size,
                result.getTotalElements(), result.getTotalPages(), result.hasNext());
    }

    @Override
    public List<TransactionAggregate> findMonthlyAggregatesByUserIdAndPeriod(UUID userId, LocalDate fromInclusive,
            LocalDate toExclusive) {
        return springData.findMonthlyAggregatesByUserIdAndPeriod(userId, fromInclusive, toExclusive).stream()
                .map(row -> new TransactionAggregate(TransactionType.valueOf(row.getType()), row.getCategory(),
                        row.getAmount()))
                .toList();
    }
}
