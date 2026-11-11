package com.moneywise.auth.application.usecase;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.auth.application.port.PasswordResetCodeRepository;
import com.moneywise.auth.domain.PasswordResetCode;

class FakePasswordResetCodeRepository implements PasswordResetCodeRepository {

    final Map<UUID, PasswordResetCode> byUserId = new HashMap<>();

    @Override
    public Optional<PasswordResetCode> findByUserId(UUID userId) {
        return Optional.ofNullable(byUserId.get(userId));
    }

    @Override
    public void save(PasswordResetCode code) {
        byUserId.put(code.getUserId(), code);
    }
}