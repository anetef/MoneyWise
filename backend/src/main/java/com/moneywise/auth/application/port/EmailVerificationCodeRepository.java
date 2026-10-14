package com.moneywise.auth.application.port;

import com.moneywise.auth.domain.EmailVerificationCode;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationCodeRepository {

    Optional<EmailVerificationCode> findByUserId(UUID userId);

    /** Insere se não existir; atualiza se já existir. */
    void save(EmailVerificationCode code);

    void deleteByUserId(UUID userId);
}
