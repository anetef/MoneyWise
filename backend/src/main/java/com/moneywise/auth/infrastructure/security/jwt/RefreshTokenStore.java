package com.moneywise.auth.infrastructure.security.jwt;

import java.util.Optional;

import com.moneywise.auth.infrastructure.persistence.refreshtoken.RefreshTokenEntity;
import java.util.List;
import java.util.UUID;

/** Onde os refresh tokens são guardados. Sempre pelo hash, nunca pelo valor do token. */
public interface RefreshTokenStore {

    void save(RefreshTokenEntity token);

    Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);
    /** Refresh tokens do usuário que ainda não foram revogados. */
    List<RefreshTokenEntity> findNotRevokedByUserId(UUID userId);
}