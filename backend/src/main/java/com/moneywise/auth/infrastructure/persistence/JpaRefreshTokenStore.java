package com.moneywise.auth.infrastructure.persistence;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.moneywise.auth.infrastructure.security.RefreshTokenStore;

/** Implementação de RefreshTokenStore com JPA e PostgreSQL (tabela refresh_tokens). */
@Component
public class JpaRefreshTokenStore implements RefreshTokenStore {

    private final SpringDataRefreshTokenRepository repository;

    public JpaRefreshTokenStore(SpringDataRefreshTokenRepository repository) {
        this.repository = repository;
    }

    @Override
    public void save(RefreshTokenEntity token) {
        repository.save(token);
    }

    @Override
    public Optional<RefreshTokenEntity> findByTokenHash(String tokenHash) {
        return repository.findByTokenHash(tokenHash);
    }
}