package com.moneywise.transactions.infrastructure.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.moneywise.transactions.application.port.CategoryCatalog;

@Repository
public class JdbcCategoryCatalog implements CategoryCatalog {

    private final JdbcTemplate jdbc;

    public JdbcCategoryCatalog(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<String> findSavedNames(UUID userId) {
        return jdbc.queryForList("""
            SELECT name
              FROM user_categories
             WHERE user_id = ?
             ORDER BY created_at, id
            """, String.class, userId);
    }

    @Override
    public List<Usage> findTransactionUsage(UUID userId) {
        return jdbc.query("""
            SELECT MIN(btrim(category)) AS name,
                   COUNT(*) AS usage_count
              FROM transactions
             WHERE user_id = ?
             GROUP BY lower(btrim(category))
            """,
            (rs, rowNum) -> new Usage(
                rs.getString("name"),
                rs.getLong("usage_count")
            ),
            userId
        );
    }

    @Override
    public boolean insert(UUID userId, String name) {
        int count = jdbc.update("""
            INSERT INTO user_categories (id, user_id, name)
            VALUES (?, ?, ?)
            ON CONFLICT DO NOTHING
            """,
            UUID.randomUUID(),
            userId,
            name
        );

        return count == 1;
    }
}
