package com.moneywise.auth.infrastructure.security.jwt;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

import com.moneywise.auth.application.port.TokenService;
import com.moneywise.auth.infrastructure.persistence.refreshtoken.RefreshTokenEntity;

/**
 * Implementa o port TokenService (AD-07, decisões L-13 e L-01).
 * Access token: JWT de curta duração. Refresh token: valor aleatório, guardado no banco só como hash.
 */
@Component
public class JwtTokenService implements TokenService {

    static final String ISSUER = "moneywise";

    /** 32 bytes = 256 bits de aleatoriedade: impossível de adivinhar. */
    private static final int REFRESH_TOKEN_BYTES = 32;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final JwtEncoder encoder;
    private final JwtDecoder decoder;
    private final Duration accessTokenTtl;
    private final Duration refreshTokenTtl;
    private final RefreshTokenStore refreshTokenStore;
    private final Clock clock;

    public JwtTokenService(JwtEncoder encoder, JwtDecoder decoder, JwtProperties properties,
            RefreshTokenStore refreshTokenStore, Clock clock) {
        this.encoder = encoder;
        this.decoder = decoder;
        this.accessTokenTtl = properties.accessTokenTtl();
        this.refreshTokenTtl = properties.refreshTokenTtl();
        this.refreshTokenStore = refreshTokenStore;
        this.clock = clock;
    }

    @Override
    public String issueAccessToken(UUID userId) {
        Objects.requireNonNull(userId, "O id do usuário é obrigatório.");
        Instant now = clock.instant();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(userId.toString())
                .issuedAt(now)
                .expiresAt(now.plus(accessTokenTtl))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();

        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    @Override
    public Optional<UUID> validateAccessToken(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            return Optional.empty();
        }
        try {
            Jwt jwt = decoder.decode(accessToken);
            String subject = jwt.getSubject();
            return subject == null ? Optional.empty() : Optional.of(UUID.fromString(subject));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }


    @Override
    public String issueRefreshToken(UUID userId) {
        Objects.requireNonNull(userId, "O id do usuário é obrigatório.");

        byte[] bytes = new byte[REFRESH_TOKEN_BYTES];
        RANDOM.nextBytes(bytes);
        String refreshToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        Instant expiresAt = clock.instant().plus(refreshTokenTtl);
        refreshTokenStore.save(new RefreshTokenEntity(UUID.randomUUID(), userId, sha256(refreshToken), expiresAt));

        return refreshToken;
    }

    @Override
    public Optional<UUID> validateRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return Optional.empty();
        }
        Instant now = clock.instant();
        return refreshTokenStore.findByTokenHash(sha256(refreshToken))
                .filter(token -> token.isActiveAt(now))
                .map(RefreshTokenEntity::getUserId);
    }

    @Override
    public void revokeRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        refreshTokenStore.findByTokenHash(sha256(refreshToken)).ifPresent(token -> {
            token.revoke(clock.instant());
            refreshTokenStore.save(token);
        });
    }

    /** SHA-256 em hexadecimal (64 caracteres). É isso que vai para o banco, nunca o token. */
    static String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 não disponível na JVM.", e);
        }
    }
}