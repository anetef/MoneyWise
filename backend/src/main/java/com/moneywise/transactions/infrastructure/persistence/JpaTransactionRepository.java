package com.moneywise.transactions.infrastructure.persistence;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.moneywise.shared.exception.ResourceNotFoundException;
import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.domain.Category;
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
        springData.findUserIdById(transaction.getId()).ifPresent(ownerId -> {
            if (!ownerId.equals(transaction.getUserId())) {
                throw new ResourceNotFoundException("Transação não encontrada.");
            }
        });
        springData.save(TransactionMapper.toEntity(transaction));
        return transaction;
    }

    @Override
    public Optional<Transaction> findByIdAndUserId(UUID id, UUID userId) {
        return springData.findRowByIdAndUserId(id, userId).map(TransactionMapper::toDomain);
    }

    @Override
    public List<Transaction> findByUserIdAndFilters(UUID userId, Category category, LocalDate from, LocalDate to) {
        String categoryName = category == null ? null : category.name();
        return springData.findRowsByUserIdAndFilters(userId, categoryName, from, to).stream()
                .map(TransactionMapper::toDomain).toList();
    }
}
