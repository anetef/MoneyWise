package com.moneywise.auth.infrastructure.persistence;

import com.moneywise.auth.application.port.EmailVerificationCodeRepository;
import com.moneywise.auth.domain.EmailVerificationCode;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Repository
public class JpaEmailVerificationCodeRepository implements EmailVerificationCodeRepository {

    private final SpringDataEmailVerificationCodeRepository repository;

    public JpaEmailVerificationCodeRepository(SpringDataEmailVerificationCodeRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<EmailVerificationCode> findByUserId(UUID userId) {
        return repository.findByUserId(userId).map(JpaEmailVerificationCodeRepository::toDomain);
    }

    @Override
    @Transactional
    public void save(EmailVerificationCode code) {
        EmailVerificationCodeEntity entity = repository.findById(code.getId())
                .orElseGet(() -> new EmailVerificationCodeEntity(
                        code.getId(), code.getUserId(), code.getCodeHash(),
                        code.getExpiresAt(), code.getLastSentAt()));
        entity.update(code.getCodeHash(), code.getExpiresAt(), code.getAttempts(), code.getLastSentAt());
        repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteByUserId(UUID userId) {
        repository.deleteByUserId(userId);
    }

    private static EmailVerificationCode toDomain(EmailVerificationCodeEntity entity) {
        return EmailVerificationCode.restore(entity.getId(), entity.getUserId(), entity.getCodeHash(),
                entity.getExpiresAt(), entity.getAttempts(), entity.getLastSentAt());
    }
}
