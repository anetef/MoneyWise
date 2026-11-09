package com.moneywise.goals.infrastructure.persistence;

import java.util.Collection;
import java.util.Currency;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.moneywise.goals.application.port.ContributorNameQuery;
import com.moneywise.goals.application.port.UserCurrencyQuery;

@Repository
public class JdbcGoalUserQuery implements UserCurrencyQuery, ContributorNameQuery {

    private final NamedParameterJdbcTemplate jdbc;

    public JdbcGoalUserQuery(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public Optional<Currency> findCurrencyByUserId(UUID userId) {
        List<String> codes = jdbc.queryForList("SELECT currency FROM users WHERE id = :id",
                Map.of("id", userId), String.class);
        return codes.stream().findFirst().map(code -> Currency.getInstance(code.strip()));
    }

    @Override
    public Map<UUID, String> findNamesByUserIds(Collection<UUID> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }
        Map<UUID, String> names = new HashMap<>();
        jdbc.query("SELECT id, name FROM users WHERE id IN (:ids)", Map.of("ids", userIds),
                (row) -> {
                    names.put(row.getObject("id", UUID.class), row.getString("name"));
                });
        return names;
    }
}