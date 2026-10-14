package com.moneywise.auth.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class EmailVerificationCodeTest {

    private static final Instant NOW = Instant.parse("2026-10-13T12:00:00Z");
    private static final UUID USER_ID = UUID.randomUUID();

    @Test
    @DisplayName("Guarda só o hash, nunca o código")
    void shouldStoreOnlyHash() {
        EmailVerificationCode code = EmailVerificationCode.issue(USER_ID, "123456", NOW);

        assertThat(code.getCodeHash()).isNotEqualTo("123456").hasSize(64);
        assertThat(code.matches("123456")).isTrue();
        assertThat(code.matches("654321")).isFalse();
        assertThat(code.matches(null)).isFalse();
    }

    @Test
    @DisplayName("Vence 15 minutos depois de emitido")
    void shouldExpireAfter15Minutes() {
        EmailVerificationCode code = EmailVerificationCode.issue(USER_ID, "123456", NOW);

        assertThat(code.isExpiredAt(NOW.plus(Duration.ofMinutes(14)))).isFalse();
        assertThat(code.isExpiredAt(NOW.plus(Duration.ofMinutes(15)))).isTrue();
    }

    @Test
    @DisplayName("Só permite reenviar depois de 1 minuto")
    void shouldRespectResendCooldown() {
        EmailVerificationCode code = EmailVerificationCode.issue(USER_ID, "123456", NOW);

        assertThat(code.canResendAt(NOW.plusSeconds(59))).isFalse();
        assertThat(code.canResendAt(NOW.plusSeconds(60))).isTrue();
    }

    @Test
    @DisplayName("Esgota na 5ª tentativa errada")
    void shouldExhaustAfterMaxAttempts() {
        EmailVerificationCode code = EmailVerificationCode.issue(USER_ID, "123456", NOW);

        for (int i = 0; i < 4; i++) {
            code.registerFailedAttempt();
        }
        assertThat(code.hasExhaustedAttempts()).isFalse();

        code.registerFailedAttempt();
        assertThat(code.hasExhaustedAttempts()).isTrue();
    }

    @Test
    @DisplayName("Reenvio troca o código, renova o prazo e zera as tentativas")
    void shouldReplaceCode() {
        EmailVerificationCode code = EmailVerificationCode.issue(USER_ID, "123456", NOW);
        code.registerFailedAttempt();
        Instant later = NOW.plus(Duration.ofMinutes(5));

        code.replace("999999", later);

        assertThat(code.matches("123456")).isFalse();
        assertThat(code.matches("999999")).isTrue();
        assertThat(code.getAttempts()).isZero();
        assertThat(code.getExpiresAt()).isEqualTo(later.plus(Duration.ofMinutes(15)));
        assertThat(code.getLastSentAt()).isEqualTo(later);
    }
}
