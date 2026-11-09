package com.moneywise.groups.infrastructure.persistence;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.moneywise.groups.application.port.MemberNameQuery;

import jakarta.persistence.EntityManager;

/**
 * Lê apenas {@code users.id} e {@code users.name} por SQL. Fica no adapter de grupos para não criar
 * dependência Java com o módulo auth (regras do ArchUnit) e nunca toca em dados financeiros.
 */
@Repository
public class JpaMemberNameQuery implements MemberNameQuery {

    private final EntityManager entityManager;

    public JpaMemberNameQuery(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<UUID, String> findNamesByUserIds(Collection<UUID> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }
        @SuppressWarnings("unchecked")
        List<Object[]> rows = entityManager
                .createNativeQuery("select id, name from users where id in (:ids)")
                .setParameter("ids", userIds)
                .getResultList();
        Map<UUID, String> names = new LinkedHashMap<>();
        for (Object[] row : rows) {
            UUID id = row[0] instanceof UUID uuid ? uuid : UUID.fromString(row[0].toString());
            names.put(id, (String) row[1]);
        }
        return names;
    }
}
