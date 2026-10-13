package com.moneywise.auth.infrastructure;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;

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
        UserEntity saved = springData.save(UserMapper.toEntity(user));
        return UserMapper.toDomain(saved);
    }
}
