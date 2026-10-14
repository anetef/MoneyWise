package com.moneywise.auth.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Currency;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.EmailVerificationCode;
import com.moneywise.auth.domain.User;
import com.moneywise.shared.exception.TooManyRequestsException;

class ResendVerificationCodeTest {

    private static final Instant SENT_AT = Instant.parse("2026-10-13T12:00:00Z");

    private final FakeUserRepository users = new FakeUserRepository();
    private final FakeEmailVerificationCodeRepository codes = new FakeEmailVerificationCodeRepository();
    private final FakeEmailSender emailSender = new FakeEmailSender();

    /** Monta o caso de uso como se o relógio marcasse SENT_AT + segundos. */
    private ResendVerificationCode resendAt(long secondsAfterSent) {
        Clock clock = Clock.fixed(SENT_AT.plusSeconds(secondsAfterSent), ZoneOffset.UTC);
        return new ResendVerificationCode(users, codes, new SendVerificationCode(codes, emailSender, clock), clock);
    }

    private User userWithPendingCode() {
        User user = User.register("Maria", Email.of("maria@gmail.com"), "hashed:x", Currency.getInstance("BRL"));
        users.save(user);
        codes.save(EmailVerificationCode.issue(user.getId(), "123456", SENT_AT));
        return user;
    }

    @Test
    @DisplayName("Recusa reenvio antes de 1 minuto")
    void shouldRejectResendTooSoon() {
        userWithPendingCode();

        assertThatThrownBy(() -> resendAt(30).execute("maria@gmail.com"))
                .isInstanceOf(TooManyRequestsException.class)
                .extracting("code").isEqualTo(ResendVerificationCode.RESEND_TOO_SOON);
        assertThat(emailSender.sentCount).isZero();
    }

    @Test
    @DisplayName("Depois de 1 minuto, envia um código novo e o antigo deixa de valer")
    void shouldResendAfterCooldown() {
        User user = userWithPendingCode();

        resendAt(60).execute("maria@gmail.com");

        assertThat(emailSender.sentCount).isEqualTo(1);
        EmailVerificationCode code = codes.findByUserId(user.getId()).orElseThrow();
        assertThat(code.matches(emailSender.lastCode)).isTrue();
    }

    @Test
    @DisplayName("E-mail desconhecido: não faz nada e não dá erro")
    void shouldIgnoreUnknownEmail() {
        resendAt(60).execute("ninguem@gmail.com");

        assertThat(emailSender.sentCount).isZero();
    }

    @Test
    @DisplayName("E-mail já confirmado: não faz nada e não dá erro")
    void shouldIgnoreVerifiedUser() {
        User user = userWithPendingCode();
        user.markEmailVerified(SENT_AT);
        users.save(user);

        resendAt(60).execute("maria@gmail.com");

        assertThat(emailSender.sentCount).isZero();
    }
}