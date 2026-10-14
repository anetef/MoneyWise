package com.moneywise.auth.domain;

import java.time.Instant;
import java.util.Currency;
import java.util.Objects;
import java.util.UUID;

import com.moneywise.shared.exception.BusinessRuleException;

/**
 * Entidade de domínio: usuário do MoneyWise.
 * Java puro, sem Spring nem JPA. A versão para o banco (UserEntity) fica na infrastructure.
 */
public class User {

    public static final int NAME_MAX_LENGTH = 100;

    private final UUID id;
    private final String name;
    private final Email email;
    private final String passwordHash;
    private final Currency currency;
    private Instant emailVerifiedAt;

    private User(UUID id, String name, Email email, String passwordHash, Currency currency, Instant emailVerifiedAt) {
        this.id = Objects.requireNonNull(id, "O id é obrigatório.");
        this.name = validateName(name);
        this.email = Objects.requireNonNull(email, "O e-mail é obrigatório.");
        this.passwordHash = requireText(passwordHash, "O hash da senha é obrigatório.");
        this.currency = Objects.requireNonNull(currency, "A moeda é obrigatória.");
        this.emailVerifiedAt = emailVerifiedAt;
    }

    /** Cria um usuário novo, no cadastro. O id é gerado aqui, e o e-mail começa não confirmado. */
    public static User register(String name, Email email, String passwordHash, Currency currency) {
        return new User(UUID.randomUUID(), name, email, passwordHash, currency, null);
    }

    /** Reconstrói um usuário que já existe, por exemplo ao ler do banco. */
    public static User restore(UUID id, String name, Email email, String passwordHash, Currency currency,
            Instant emailVerifiedAt) {
        return new User(id, name, email, passwordHash, currency, emailVerifiedAt);
    }

    /** O usuário só pode entrar no app depois de confirmar o e-mail. */
    public boolean isEmailVerified() {
        return emailVerifiedAt != null;
    }

    /** Marca o e-mail como confirmado. Se já estava confirmado, mantém a data original. */
    public void markEmailVerified(Instant at) {
        Objects.requireNonNull(at, "A data da confirmação é obrigatória.");
        if (emailVerifiedAt == null) {
            emailVerifiedAt = at;
        }
    }

    private static String validateName(String name) {
        Objects.requireNonNull(name, "O nome é obrigatório.");
        String trimmed = name.strip();
        if (trimmed.isEmpty() || trimmed.length() > NAME_MAX_LENGTH) {
            throw new BusinessRuleException("INVALID_NAME",
                    "O nome deve ter entre 1 e " + NAME_MAX_LENGTH + " caracteres.");
        }
        return trimmed;
    }

    private static String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Email getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Currency getCurrency() {
        return currency;
    }

    public Instant getEmailVerifiedAt() {
        return emailVerifiedAt;
    }

    /** Dois usuários são o mesmo se têm o mesmo id. */
    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof User user)) {
            return false;
        }
        return id.equals(user.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }

    /** Nunca inclui o hash da senha, para ele não vazar em logs. */
    @Override
    public String toString() {
        return "User[id=" + id + ", email=" + email + "]";
    }
}