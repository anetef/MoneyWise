package com.moneywise.auth.infrastructure.security;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
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

/**
 * Implementa o port TokenService com JWT .
 */
@Component
public class JwtTokenService implements TokenService {

    static final String ISSUER = "moneywise";

    private final JwtEncoder encoder;
    private final JwtDecoder decoder;
    private final Duration accessTokenTtl;
    private final Clock clock;

    public JwtTokenService(JwtEncoder encoder, JwtDecoder decoder, JwtProperties properties, Clock clock) {
        this.encoder = encoder;
        this.decoder = decoder;
        this.accessTokenTtl = properties.accessTokenTtl();
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
        throw new UnsupportedOperationException("Refresh token: SEC-03, parte B.");
    }

    @Override
    public Optional<UUID> validateRefreshToken(String refreshToken) {
        throw new UnsupportedOperationException("Refresh token: SEC-03, parte B.");
    }

    @Override
    public void revokeRefreshToken(String refreshToken) {
        throw new UnsupportedOperationException("Refresh token: SEC-03, parte B.");
    }
}
