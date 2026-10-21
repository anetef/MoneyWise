package com.moneywise.transactions.application.port;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.transactions.domain.Transaction;

/** Persistência de transações. Toda leitura exige o usuário dono dos dados. */
public interface TransactionRepository {

    Transaction save(Transaction transaction);

    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);

    List<Transaction> findByUserIdAndFilters(UUID userId, String category, LocalDate from, LocalDate to);
}
