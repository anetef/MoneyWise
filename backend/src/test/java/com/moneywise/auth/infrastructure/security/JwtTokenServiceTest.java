package com.moneywise.auth.infrastructure.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

import com.moneywise.auth.infrastructure.persistence.RefreshTokenEntity;

class JwtTokenServiceTest {

    private static final String SECRET = "segredo-de-teste-com-pelo-menos-32-caracteres";
    private static final String OTHER_SECRET = "outro-segredo-de-teste-tambem-com-32-caracteres";
    private static final Duration TTL = Duration.ofMinutes(15);

    private final JwtConfig config = new JwtConfig();
    private final InMemoryRefreshTokenStore store = new InMemoryRefreshTokenStore();

    /** Monta um serviço com o segredo e o relógio escolhidos, sem precisar do Spring. */
    private JwtTokenService service(String secret, Clock clock) {
        JwtProperties properties = new JwtProperties(secret, TTL, null);
        SecretKey key = config.jwtSecretKey(properties);
        return new JwtTokenService(config.jwtEncoder(key), config.jwtDecoder(key), properties, store, clock);
    }

    private JwtTokenService service() {
        return service(SECRET, Clock.systemUTC());
    }

    // ---------- Access token (parte A) ----------

    @Test
    @DisplayName("Emite um token válido que devolve o id do usuário")
    void shouldIssueAndValidateToken() {
        UUID userId = UUID.randomUUID();

        String token = service().issueAccessToken(userId);

        assertThat(service().validateAccessToken(token)).hasValue(userId);
    }

    @Test
    @DisplayName("A duração do token vem da configuração")
    void shouldUseConfiguredDuration() {
        String token = service().issueAccessToken(UUID.randomUUID());

        JwtDecoder decoder = config.jwtDecoder(config.jwtSecretKey(new JwtProperties(SECRET, TTL, null)));
        Jwt jwt = decoder.decode(token);

        assertThat(Duration.between(jwt.getIssuedAt(), jwt.getExpiresAt())).isEqualTo(TTL);
    }

    @Test
    @DisplayName("Rejeita token expirado")
    void shouldRejectExpiredToken() {
        Clock oneHourAgo = Clock.fixed(Instant.now().minus(1, ChronoUnit.HOURS), ZoneOffset.UTC);
        String expiredToken = service(SECRET, oneHourAgo).issueAccessToken(UUID.randomUUID());

        assertThat(service().validateAccessToken(expiredToken)).isEmpty();
    }

    @Test
    @DisplayName("Rejeita token adulterado (conteúdo alterado depois de assinado)")
    void shouldRejectTamperedToken() {
        UUID victim = UUID.randomUUID();
        UUID attacker = UUID.randomUUID();
        String token = service().issueAccessToken(attacker);

        String[] parts = token.split("\\.");
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        String forgedPayload = payload.replace(attacker.toString(), victim.toString());
        String forgedPart = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(forgedPayload.getBytes(StandardCharsets.UTF_8));
        String tamperedToken = parts[0] + "." + forgedPart + "." + parts[2];

        assertThat(service().validateAccessToken(tamperedToken)).isEmpty();
    }

    @Test
    @DisplayName("Rejeita token assinado com outro segredo")
    void shouldRejectTokenWithWrongSignature() {
        String foreignToken = service(OTHER_SECRET, Clock.systemUTC()).issueAccessToken(UUID.randomUUID());

        assertThat(service().validateAccessToken(foreignToken)).isEmpty();
    }

    @Test
    @DisplayName("Rejeita texto que não é um JWT")
    void shouldRejectGarbage() {
        assertThat(service().validateAccessToken("isso-nao-e-um-token")).isEmpty();
    }

    @Test
    @DisplayName("Rejeita token nulo ou vazio")
    void shouldRejectNullOrBlank() {
        assertThat(service().validateAccessToken(null)).isEmpty();
        assertThat(service().validateAccessToken("   ")).isEmpty();
    }

    // ---------- Refresh token (parte B) ----------

    @Test
    @DisplayName("Emite um refresh token válido que devolve o id do usuário")
    void shouldIssueAndValidateRefreshToken() {
        UUID userId = UUID.randomUUID();

        String refreshToken = service().issueRefreshToken(userId);

        assertThat(service().validateRefreshToken(refreshToken)).hasValue(userId);
    }

    @Test
    @DisplayName("Guarda só o hash do refresh token, nunca o valor")
    void shouldStoreOnlyTheHash() {
        String refreshToken = service().issueRefreshToken(UUID.randomUUID());

        assertThat(store.all()).hasSize(1);
        RefreshTokenEntity saved = store.all().values().iterator().next();
        assertThat(saved.getTokenHash())
                .isNotEqualTo(refreshToken)
                .isEqualTo(JwtTokenService.sha256(refreshToken))
                .hasSize(64);
    }

    @Test
    @DisplayName("Cada refresh token emitido é diferente")
    void shouldIssueDifferentRefreshTokens() {
        UUID userId = UUID.randomUUID();

        assertThat(service().issueRefreshToken(userId)).isNotEqualTo(service().issueRefreshToken(userId));
    }

    @Test
    @DisplayName("O refresh token vence depois da duração configurada (30 dias)")
    void shouldRejectExpiredRefreshToken() {
        Clock thirtyOneDaysAgo = Clock.fixed(Instant.now().minus(31, ChronoUnit.DAYS), ZoneOffset.UTC);
        String refreshToken = service(SECRET, thirtyOneDaysAgo).issueRefreshToken(UUID.randomUUID());

        assertThat(service().validateRefreshToken(refreshToken)).isEmpty();
    }

    @Test
    @DisplayName("Refresh token revogado não é mais aceito")
    void shouldRejectRevokedRefreshToken() {
        String refreshToken = service().issueRefreshToken(UUID.randomUUID());

        service().revokeRefreshToken(refreshToken);

        assertThat(service().validateRefreshToken(refreshToken)).isEmpty();
    }

    @Test
    @DisplayName("Rotação: o refresh token antigo deixa de valer e o novo vale")
    void shouldRotateRefreshToken() {
        UUID userId = UUID.randomUUID();
        String oldToken = service().issueRefreshToken(userId);

        // o que o endpoint /auth/refresh vai fazer na SEC-05
        UUID owner = service().validateRefreshToken(oldToken).orElseThrow();
        service().revokeRefreshToken(oldToken);
        String newToken = service().issueRefreshToken(owner);

        assertThat(service().validateRefreshToken(oldToken)).isEmpty();
        assertThat(service().validateRefreshToken(newToken)).hasValue(userId);
    }

    @Test
    @DisplayName("Rejeita refresh token desconhecido, nulo ou vazio")
    void shouldRejectUnknownRefreshToken() {
        assertThat(service().validateRefreshToken("token-que-nunca-foi-emitido")).isEmpty();
        assertThat(service().validateRefreshToken(null)).isEmpty();
        assertThat(service().validateRefreshToken("  ")).isEmpty();
    }

    @Test
    @DisplayName("Revogar um token desconhecido não lança erro")
    void shouldIgnoreRevokeOfUnknownToken() {
        service().revokeRefreshToken("token-que-nunca-foi-emitido");
        service().revokeRefreshToken(null);

        assertThat(store.all()).isEmpty();
    }
}