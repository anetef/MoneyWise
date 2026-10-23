package com.moneywise.auth.infrastructure.security.jwt;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

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

    Map<String, RefreshTokenEntity> all() {
        return byHash;
    }
}