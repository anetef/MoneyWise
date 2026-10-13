package com.moneywise.auth.application.usecase;

import com.moneywise.auth.application.port.PasswordHasher;

/** PasswordHasher previsível para testes: o "hash" é a senha com um prefixo. */
class FakePasswordHasher implements PasswordHasher {

    @Override
    public String hash(String rawPassword) {
        return "hashed:" + rawPassword;
    }

    @Override
    public boolean matches(String rawPassword, String passwordHash) {
        return passwordHash != null && passwordHash.equals(hash(rawPassword));
    }
}