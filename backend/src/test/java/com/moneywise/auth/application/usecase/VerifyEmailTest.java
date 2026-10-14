package com.moneywise.auth.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Currency;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.EmailVerificationCode;
import com.moneywise.auth.domain.User;
import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ConflictException;

class VerifyEmailTest {

    private static final Instant SENT_AT = Instant.parse("2026-10-13T12:00:00Z");

    private final FakeUserRepository users = new FakeUserRepository();
    private final FakeEmailVerificationCodeRepository codes = new FakeEmailVerificationCodeRepository();
    private final FakeTokenService tokenService = new FakeTokenService();

    private VerifyEmail verifyAt(Duration afterSent) {
        Clock clock = Clock.fixed(SENT_AT.plus(afterSent), ZoneOffset.UTC);
        return new VerifyEmail(users, codes, tokenService, clock);
    }

    private User userWithPendingCode() {
        User user = User.register("Maria", Email.of("maria@gmail.com"), "hashed:x", Currency.getInstance("BRL"));
        users.save(user);
        codes.save(EmailVerificationCode.issue(user.getId(), "123456", SENT_AT));
        return user;
    }

    @Test
    @DisplayName("Código certo: confirma o e-mail, apaga o código e devolve tokens")
    void shouldVerifyWithCorrectCode() {
        User user = userWithPendingCode();

        LoginResult result = verifyAt(Duration.ofMinutes(5)).execute(new VerifyEmailCommand("maria@gmail.com", "123456"));

        assertThat(result.user().isEmailVerified()).isTrue();
        assertThat(result.accessToken()).isNotBlank();
        assertThat(result.refreshToken()).isNotBlank();
        assertThat(codes.findByUserId(user.getId())).isEmpty();
    }

    @Test
    @DisplayName("Código errado: 422 e conta a tentativa")
    void shouldCountWrongAttempt() {
        User user = userWithPendingCode();

        assertThatThrownBy(() -> verifyAt(Duration.ofMinutes(1)).execute(new VerifyEmailCommand("maria@gmail.com", "000000")))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo(VerifyEmail.INVALID_VERIFICATION_CODE);
        assertThat(codes.findByUserId(user.getId()).orElseThrow().getAttempts()).isEqualTo(1);
    }

    @Test
    @DisplayName("Código vencido: recusa mesmo se estiver certo")
    void shouldRejectExpiredCode() {
        userWithPendingCode();

        assertThatThrownBy(() -> verifyAt(Duration.ofMinutes(16)).execute(new VerifyEmailCommand("maria@gmail.com", "123456")))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo(VerifyEmail.VERIFICATION_CODE_EXPIRED);
    }

    @Test
    @DisplayName("Depois de 5 erros, recusa mesmo o código certo")
    void shouldRejectAfterMaxAttempts() {
        userWithPendingCode();
        VerifyEmail verifyEmail = verifyAt(Duration.ofMinutes(1));
        for (int i = 0; i < EmailVerificationCode.MAX_ATTEMPTS; i++) {
            assertThatThrownBy(() -> verifyEmail.execute(new VerifyEmailCommand("maria@gmail.com", "000000")))
                    .isInstanceOf(BusinessRuleException.class);
        }

        assertThatThrownBy(() -> verifyEmail.execute(new VerifyEmailCommand("maria@gmail.com", "123456")))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo(VerifyEmail.VERIFICATION_ATTEMPTS_EXCEEDED);
    }

    @Test
    @DisplayName("E-mail desconhecido: mesmo erro de código inválido")
    void shouldRejectUnknownEmailAsInvalidCode() {
        assertThatThrownBy(() -> verifyAt(Duration.ofMinutes(1)).execute(new VerifyEmailCommand("ninguem@gmail.com", "123456")))
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo(VerifyEmail.INVALID_VERIFICATION_CODE);
    }

    @Test
    @DisplayName("E-mail já confirmado: 409")
    void shouldRejectAlreadyVerified() {
        User user = userWithPendingCode();
        user.markEmailVerified(SENT_AT);
        users.save(user);

        assertThatThrownBy(() -> verifyAt(Duration.ofMinutes(1)).execute(new VerifyEmailCommand("maria@gmail.com", "123456")))
                .isInstanceOf(ConflictException.class)
                .extracting("code").isEqualTo(VerifyEmail.EMAIL_ALREADY_VERIFIED);
    }
}
