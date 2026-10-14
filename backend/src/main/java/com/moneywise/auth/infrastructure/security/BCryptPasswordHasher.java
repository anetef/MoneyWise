package com.moneywise.auth.infrastructure.security;

import java.util.Objects;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.moneywise.auth.application.port.PasswordHasher;

/**
 * Implementa o port PasswordHasher com BCrypt.
 * A senha em texto puro só existe em memória, durante a chamada: nunca é guardada nem registrada em log.
 */
@Component
public class BCryptPasswordHasher implements PasswordHasher {

    private final PasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public String hash(String rawPassword) {
        Objects.requireNonNull(rawPassword, "A senha é obrigatória.");
        return encoder.encode(rawPassword);
    }

    @Override
    public boolean matches(String rawPassword, String passwordHash) {
        if (rawPassword == null || passwordHash == null) {
            return false;
        }
        return encoder.matches(rawPassword, passwordHash);
    }
}
