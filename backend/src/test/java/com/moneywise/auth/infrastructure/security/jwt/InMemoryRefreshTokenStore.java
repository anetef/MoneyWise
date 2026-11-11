package com.moneywise.auth.infrastructure.security.jwt;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.auth.infrastructure.persistence.refreshtoken.RefreshTokenEntity;
import com.moneywise.auth.infrastructure.security.jwt.RefreshTokenStore;

/** Versão em memória do RefreshTokenStore, para testes unitários sem banco. */
class InMemoryRefreshTokenStore implements RefreshTokenStore {

    private final Map<String, RefreshTokenEntity> byHash = new HashMap<>();

    @Override
    public void save(RefreshTokenEntity token) {
        byHash.put(token.getTokenHash(), token);
    }

    @Override
    public Optional<RefreshTokenEntity> findByTokenHash(String tokenHash) {
        return Optional.ofNullable(byHash.get(tokenHash));
    }

    @Override
    public List<RefreshTokenEntity> findNotRevokedByUserId(UUID userId) {
        return byHash.values().stream()
                .filter(token -> token.getUserId().equals(userId) && token.getRevokedAt() == null)
                .toList();
    }
    Map<String, RefreshTokenEntity> all() {
        return byHash;
    }
}