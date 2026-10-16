package com.moneywise.auth.infrastructure.persistence.verification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SpringDataEmailVerificationCodeRepository
        extends JpaRepository<EmailVerificationCodeEntity, UUID> {

    Optional<EmailVerificationCodeEntity> findByUserId(UUID userId);

    void deleteByUserId(UUID userId);
}
