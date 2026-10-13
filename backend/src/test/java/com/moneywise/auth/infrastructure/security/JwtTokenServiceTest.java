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


class JwtTokenServiceTest {

    private static final String SECRET = "segredo-de-teste-com-pelo-menos-32-caracteres";
    private static final String OTHER_SECRET = "outro-segredo-de-teste-tambem-com-32-caracteres";
    private static final Duration TTL = Duration.ofMinutes(15);

    private final JwtConfig config = new JwtConfig();

    /** Monta um serviço com o segredo e o relógio escolhidos, sem precisar do Spring. */
    private JwtTokenService service(String secret, Clock clock) {
            JwtProperties properties = new JwtProperties(secret, TTL);
        SecretKey key = config.jwtSecretKey(properties);
        return new JwtTokenService(config.jwtEncoder(key), config.jwtDecoder(key), properties, clock);
    }

    private JwtTokenService service() {
        return service(SECRET, Clock.systemUTC());
    }

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

        JwtDecoder decoder = config.jwtDecoder(config.jwtSecretKey(new JwtProperties(SECRET, TTL)));
        Jwt jwt = decoder.decode(token);

        assertThat(Duration.between(jwt.getIssuedAt(), jwt.getExpiresAt())).isEqualTo(TTL);
    }

    @Test
    @DisplayName("Rejeita token expirado")
    void shouldRejectExpiredToken() {
        // Um relógio parado 1 hora no passado: o token já nasce vencido há 45 minutos
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

        // O atacante troca o próprio id pelo da vítima no conteúdo, mas mantém a assinatura original
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
}
