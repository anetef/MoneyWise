package com.moneywise.auth.infrastructure.persistence.user;

import java.util.Optional;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Repository;

import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.application.usecase.register.RegisterUser;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;
import com.moneywise.shared.exception.ConflictException;

/** Implementa o port UserRepository usando JPA e PostgreSQL. */
@Repository
public class JpaUserRepository implements UserRepository {

    private final SpringDataUserRepository springData;

    public JpaUserRepository(SpringDataUserRepository springData) {
        this.springData = springData;
    }

    @Override
    public Optional<User> findById(UUID id) {
        return springData.findById(id).map(UserMapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        return springData.findByEmail(email.value()).map(UserMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(Email email) {
        return springData.existsByEmail(email.value());
    }

    @Override
    public User save(User user) {
        try {
            UserEntity saved = springData.saveAndFlush(UserMapper.toEntity(user));
            return UserMapper.toDomain(saved);
        } catch (DataIntegrityViolationException e) {
            if (isEmailUniqueViolation(e)) {
                // RN06: a constraint UNIQUE é a garantia final (cadastros simultâneos com o mesmo e-mail)
                throw new ConflictException(RegisterUser.EMAIL_ALREADY_IN_USE, "Este e-mail já está cadastrado.");
            }
            throw e;
        }
    }

    private static boolean isEmailUniqueViolation(DataIntegrityViolationException e) {
        String message = e.getMostSpecificCause().getMessage();
        return message != null && message.contains("uq_users_email");
    }
}