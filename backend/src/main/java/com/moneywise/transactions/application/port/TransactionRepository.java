package com.moneywise.transactions.application.port;

import java.time.LocalDate;
import java.time.Instant;
import java.util.Currency;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.Transaction;

/** Persistência de transações. Toda leitura exige o usuário dono dos dados. */
public interface TransactionRepository {

    Transaction save(Transaction transaction);

    /** Atualiza somente se a versão informada for atual; caso contrário, retorna a versão mais recente. */
    Transaction update(Transaction transaction, Instant expectedUpdatedAt);

    boolean deleteByIdAndUserId(UUID id, UUID userId);

    Currency findCurrencyByUserId(UUID userId);

    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);

    TransactionPage findPageByUserIdAndFilters(UUID userId, Category category, LocalDate from, LocalDate to,
            int page, int size);

    List<TransactionAggregate> findMonthlyAggregatesByUserIdAndPeriod(UUID userId, LocalDate fromInclusive,
            LocalDate toExclusive);
}
