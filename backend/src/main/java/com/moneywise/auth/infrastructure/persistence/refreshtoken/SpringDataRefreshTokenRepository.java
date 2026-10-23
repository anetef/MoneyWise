package com.moneywise.auth.infrastructure.persistence.refreshtoken;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Acesso à tabela refresh_tokens. A busca é sempre pelo hash, nunca pelo valor do token. */
public interface SpringDataRefreshTokenRepository extends JpaRepository<RefreshTokenEntity, UUID> {

    Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);
}

