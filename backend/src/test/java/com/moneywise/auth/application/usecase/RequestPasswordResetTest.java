package com.moneywise.auth.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Currency;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.auth.application.usecase.passwordreset.RequestPasswordReset;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.PasswordResetCode;
import com.moneywise.auth.domain.User;

class RequestPasswordResetTest {

    private static final Instant NOW = Instant.parse("2026-11-10T12:00:00Z");

    private final FakeUserRepository users = new FakeUserRepository();
    private final FakePasswordResetCodeRepository codes = new FakePasswordResetCodeRepository();
    private final FakeEmailSender emailSender = new FakeEmailSender();

    private RequestPasswordReset at(long secondsAfterNow) {
        Clock clock = Clock.fixed(NOW.plusSeconds(secondsAfterNow), ZoneOffset.UTC);
        return new RequestPasswordReset(users, codes, emailSender, clock);
    }

    private User existingUser() {
        User user = User.register("Maria", Email.of("maria@gmail.com"), "hashed:x", Currency.getInstance("BRL"));
        users.save(user);
        return user;
    }

    @Test
    @DisplayName("E-mail cadastrado: gera o código, guarda só o hash e envia por e-mail")
    void sendsCodeToExistingUser() {
        User user = existingUser();

        at(0).execute("maria@gmail.com");

        assertThat(emailSender.passwordResetSentCount).isEqualTo(1);
        assertThat(emailSender.lastPasswordResetTo).isEqualTo("maria@gmail.com");
        assertThat(emailSender.lastPasswordResetCode).matches("\\d{6}");
        PasswordResetCode saved = codes.findByUserId(user.getId()).orElseThrow();
        assertThat(saved.matches(emailSender.lastPasswordResetCode)).isTrue();
        assertThat(saved.getCodeHash()).isNotEqualTo(emailSender.lastPasswordResetCode);
    }

    @Test
    @DisplayName("E-mail não cadastrado ou mal formatado: não envia nada e não dá erro")
    void unknownEmailSendsNothing() {
        at(0).execute("ninguem@gmail.com");
        at(0).execute("isso-nao-e-email");
        at(0).execute(null);

        assertThat(emailSender.passwordResetSentCount).isZero();
        assertThat(codes.byUserId).isEmpty();
    }

    @Test
    @DisplayName("Pedido repetido em menos de 1 minuto é ignorado; depois de 1 minuto, troca o código")
    void ignoresRepeatedRequestWithinOneMinute() {
        User user = existingUser();
        at(0).execute("maria@gmail.com");
        String firstCode = emailSender.lastPasswordResetCode;

        at(30).execute("maria@gmail.com");
        assertThat(emailSender.passwordResetSentCount).isEqualTo(1);

        at(60).execute("maria@gmail.com");
        assertThat(emailSender.passwordResetSentCount).isEqualTo(2);
        PasswordResetCode saved = codes.findByUserId(user.getId()).orElseThrow();
        assertThat(saved.matches(emailSender.lastPasswordResetCode)).isTrue();
        if (!firstCode.equals(emailSender.lastPasswordResetCode)) {
            assertThat(saved.matches(firstCode)).isFalse();
        }
    }
}