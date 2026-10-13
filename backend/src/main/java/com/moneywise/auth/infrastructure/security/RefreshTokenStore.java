package com.moneywise.auth.infrastructure.security;

import java.util.Optional;

import com.moneywise.auth.infrastructure.persistence.RefreshTokenEntity;

/** Onde os refresh tokens são guardados. Sempre pelo hash, nunca pelo valor do token. */
public interface RefreshTokenStore {

    void save(RefreshTokenEntity token);

    Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);
}