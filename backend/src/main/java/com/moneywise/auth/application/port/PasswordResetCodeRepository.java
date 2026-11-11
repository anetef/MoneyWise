package com.moneywise.auth.application.port;

import java.util.Optional;
import java.util.UUID;

import com.moneywise.auth.domain.PasswordResetCode;

public interface PasswordResetCodeRepository {

    Optional<PasswordResetCode> findByUserId(UUID userId);

    void save(PasswordResetCode code);
}