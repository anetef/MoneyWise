package com.moneywise.transactions.infrastructure.persistence;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.Repository;

/**
 * Consultas JPA. Leituras de transações sempre são limitadas ao usuário, sem expor findAll ou findById.
 * A moeda é obtida do perfil do usuário, conforme RN09, pois não é duplicada na tabela de transações.
 */
public interface SpringDataTransactionRepository extends Repository<TransactionEntity, UUID> {

    TransactionEntity save(TransactionEntity entity);

    @Query("SELECT t.userId FROM TransactionEntity t WHERE t.id = :id")
    Optional<UUID> findUserIdById(@Param("id") UUID id);

    @Query(value = """
            SELECT t.id AS id, t.user_id AS \"userId\", t.amount AS amount, t.date AS date,
                   t.category AS category, t.type AS type, t.description AS description,
                   u.currency AS \"currency\"
              FROM transactions t JOIN users u ON u.id = t.user_id
             WHERE t.id = :id AND t.user_id = :userId
            """, nativeQuery = true)
    Optional<TransactionRow> findRowByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query(value = """
            SELECT t.id AS id, t.user_id AS \"userId\", t.amount AS amount, t.date AS date,
                   t.category AS category, t.type AS type, t.description AS description,
                   u.currency AS \"currency\"
              FROM transactions t JOIN users u ON u.id = t.user_id
             WHERE t.user_id = :userId
               AND (CAST(:category AS text) IS NULL OR t.category = :category)
               AND (CAST(:fromDate AS date) IS NULL OR t.date >= :fromDate)
               AND (CAST(:toDate AS date) IS NULL OR t.date <= :toDate)
             ORDER BY t.date DESC, t.id
            """, nativeQuery = true)
    List<TransactionRow> findRowsByUserIdAndFilters(@Param("userId") UUID userId,
            @Param("category") String category, @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);
}
