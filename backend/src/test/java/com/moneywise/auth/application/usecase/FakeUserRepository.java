package com.moneywise.auth.application.usecase;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;

/** UserRepository em memória, para testes dos casos de uso sem banco. */
class FakeUserRepository implements UserRepository {

    private final Map<UUID, User> users = new HashMap<>();

    @Override
    public Optional<User> findById(UUID id) {
        return Optional.ofNullable(users.get(id));
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        return users.values().stream().filter(u -> u.getEmail().equals(email)).findFirst();
    }

    @Override
    public boolean existsByEmail(Email email) {
        return findByEmail(email).isPresent();
    }

    @Override
    public User save(User user) {
        users.put(user.getId(), user);
        return user;
    }

    int count() {
        return users.size();
    }
}
