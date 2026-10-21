package com.moneywise.transactions.infrastructure.persistence;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.domain.Transaction;

/** Implementa o port de transações usando Spring Data JPA. */
@Repository
public class JpaTransactionRepository implements TransactionRepository {

    private final SpringDataTransactionRepository springData;

    public JpaTransactionRepository(SpringDataTransactionRepository springData) {
        this.springData = springData;
    }

    @Override
    public Transaction save(Transaction transaction) {
        springData.saveAndFlush(TransactionMapper.toEntity(transaction));
        return transaction;
    }

    @Override
    public Optional<Transaction> findByIdAndUserId(UUID id, UUID userId) {
        return springData.findRowByIdAndUserId(id, userId).map(TransactionMapper::toDomain);
    }

    @Override
    public List<Transaction> findByUserIdAndFilters(UUID userId, String category, LocalDate from, LocalDate to) {
        return springData.findRowsByUserIdAndFilters(userId, category, from, to).stream()
                .map(TransactionMapper::toDomain).toList();
    }
}
