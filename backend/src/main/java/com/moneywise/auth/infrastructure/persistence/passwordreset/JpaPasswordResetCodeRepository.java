package com.moneywise.auth.infrastructure.persistence.passwordreset;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.moneywise.auth.application.port.PasswordResetCodeRepository;
import com.moneywise.auth.domain.PasswordResetCode;

@Repository
public class JpaPasswordResetCodeRepository implements PasswordResetCodeRepository {

    private final SpringDataPasswordResetCodeRepository repository;

    public JpaPasswordResetCodeRepository(SpringDataPasswordResetCodeRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PasswordResetCode> findByUserId(UUID userId) {
        return repository.findByUserId(userId).map(JpaPasswordResetCodeRepository::toDomain);
    }

    @Override
    @Transactional
    public void save(PasswordResetCode code) {
        PasswordResetCodeEntity entity = repository.findById(code.getId())
                .orElseGet(() -> new PasswordResetCodeEntity(code.getId(), code.getUserId()));
        entity.update(code.getCodeHash(), code.getExpiresAt(), code.getAttempts(), code.getLastSentAt(),
                code.getUsedAt());
        repository.save(entity);
    }

    private static PasswordResetCode toDomain(PasswordResetCodeEntity entity) {
        return PasswordResetCode.restore(entity.getId(), entity.getUserId(), entity.getCodeHash(),
                entity.getExpiresAt(), entity.getAttempts(), entity.getLastSentAt(), entity.getUsedAt());
    }
}