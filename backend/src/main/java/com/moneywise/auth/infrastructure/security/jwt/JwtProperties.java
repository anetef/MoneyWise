package com.moneywise.auth.infrastructure.security.jwt;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuração do JWT, lida de moneywise.security.jwt no application.yaml.
 * O segredo vem sempre do ambiente (JWT_SECRET), nunca do repositório.
 */
@ConfigurationProperties(prefix = "moneywise.security.jwt")
public record JwtProperties(String secret, Duration accessTokenTtl, Duration refreshTokenTtl) {

    /** O HS256 exige uma chave de pelo menos 256 bits (32 bytes). */
    public static final int MIN_SECRET_BYTES = 32;

    public JwtProperties {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "JWT_SECRET ausente ou curto demais: use pelo menos " + MIN_SECRET_BYTES + " caracteres.");
        }
        if (accessTokenTtl == null) {
            accessTokenTtl = Duration.ofMinutes(15);
        }
        if (refreshTokenTtl == null) {
            refreshTokenTtl = Duration.ofDays(30);
        }
    }

   
}