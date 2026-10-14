package com.moneywise.auth.application.usecase;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.auth.application.port.EmailVerificationCodeRepository;
import com.moneywise.auth.domain.EmailVerificationCode;

class FakeEmailVerificationCodeRepository implements EmailVerificationCodeRepository {

    final Map<UUID, EmailVerificationCode> byUserId = new HashMap<>();

    @Override
    public Optional<EmailVerificationCode> findByUserId(UUID userId) {
        return Optional.ofNullable(byUserId.get(userId));
    }

    @Override
    public void save(EmailVerificationCode code) {
        byUserId.put(code.getUserId(), code);
    }

    @Override
    public void deleteByUserId(UUID userId) {
        byUserId.remove(userId);
    }
}