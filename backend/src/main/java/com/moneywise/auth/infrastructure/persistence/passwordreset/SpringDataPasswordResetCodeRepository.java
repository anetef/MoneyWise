package com.moneywise.auth.infrastructure.persistence.passwordreset;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataPasswordResetCodeRepository extends JpaRepository<PasswordResetCodeEntity, UUID> {

    Optional<PasswordResetCodeEntity> findByUserId(UUID userId);
}