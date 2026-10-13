package com.moneywise.auth.domain;

import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

import com.moneywise.shared.exception.BusinessRuleException;

// Um e-mail válido e normalizado (sem espaços nas pontas e em minúsculas).
public record Email(String value) {

    /** Tamanho máximo de um e-mail (RFC 5321). */
    public static final int MAX_LENGTH = 254;

    public static final String INVALID_CODE = "INVALID_EMAIL";

    // algo@algo.algo, sem espaços e com um único @
    private static final Pattern FORMAT = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    public Email {
        Objects.requireNonNull(value, "O e-mail é obrigatório.");

        value = value.strip().toLowerCase(Locale.ROOT);

        if (value.length() > MAX_LENGTH || !FORMAT.matcher(value).matches()) {
            throw new BusinessRuleException(INVALID_CODE, "E-mail inválido.");
        }
    }

    public static Email of(String value) {
        return new Email(value);
    }

    @Override
    public String toString() {
        return value;
    }
}
