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

import com.moneywise.auth.application.usecase.passwordreset.PasswordResetCodeChecker;
import com.moneywise.auth.application.usecase.passwordreset.ResetPassword;
import com.moneywise.auth.application.usecase.passwordreset.ResetPasswordCommand;
import com.moneywise.auth.application.usecase.passwordreset.VerifyPasswordResetCode;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.PasswordResetCode;
import com.moneywise.auth.domain.User;
import com.moneywise.shared.exception.BusinessRuleException;

class PasswordResetCodeUseCasesTest {

    private static final Instant SENT_AT = Instant.parse("2026-11-10T12:00:00Z");
    private static final String EMAIL = "maria@gmail.com";
    private static final String CODE = "123456";

    private final FakeUserRepository users = new FakeUserRepository();
    private final FakePasswordResetCodeRepository codes = new FakePasswordResetCodeRepository();
    private final FakePasswordHasher passwordHasher = new FakePasswordHasher();
    private final FakeRefreshTokenService tokenService = new FakeRefreshTokenService();

    private Clock clockAt(Duration afterSent) {
        return Clock.fixed(SENT_AT.plus(afterSent), ZoneOffset.UTC);
    }

    private VerifyPasswordResetCode verifyAt(Duration afterSent) {
        return new VerifyPasswordResetCode(users, codes, clockAt(afterSent));
    }

    private ResetPassword resetAt(Duration afterSent) {
        return new ResetPassword(users, codes, passwordHasher, tokenService, new FakeUnitOfWork(),
                clockAt(afterSent));
    }

    private User userWithCode() {
        User user = User.register("Maria", Email.of(EMAIL), passwordHasher.hash("senhaAntiga1"),
                Currency.getInstance("BRL"));
        user.markEmailVerified(SENT_AT.minus(Duration.ofDays(30)));
        users.save(user);
        codes.save(PasswordResetCode.issue(user.getId(), CODE, SENT_AT));
        return user;
    }

    private void assertInvalidCode(Runnable action) {
        assertThatThrownBy(action::run)
                .isInstanceOf(BusinessRuleException.class)
                .extracting("code").isEqualTo(PasswordResetCodeChecker.INVALID_RESET_CODE);
    }

    // ---------- verify-code ----------

    @Test
    @DisplayName("verify-code: código certo passa e o código continua valendo para o reset")
    void verifyAcceptsCorrectCodeWithoutUsingIt() {
        User user = userWithCode();

        verifyAt(Duration.ofMinutes(1)).execute(EMAIL, CODE);

        PasswordResetCode code = codes.findByUserId(user.getId()).orElseThrow();
        assertThat(code.getUsedAt()).isNull();
        assertThat(code.getAttempts()).isZero();
    }

    @Test
    @DisplayName("verify-code: código errado → erro e conta uma tentativa")
    void verifyRejectsWrongCodeAndCountsAttempt() {
        User user = userWithCode();

        assertInvalidCode(() -> verifyAt(Duration.ofMinutes(1)).execute(EMAIL, "000000"));

        assertThat(codes.findByUserId(user.getId()).orElseThrow().getAttempts()).isEqualTo(1);
    }

    // ---------- reset ----------

    @Test
    @DisplayName("reset: troca a senha, marca o código como usado e derruba as sessões")
    void resetChangesPasswordUsesCodeAndRevokesSessions() {
        User user = userWithCode();
        String phoneSession = tokenService.issueRefreshToken(user.getId());

        resetAt(Duration.ofMinutes(2)).execute(new ResetPasswordCommand(EMAIL, CODE, "senhaNova123"));

        User saved = users.findById(user.getId()).orElseThrow();
        assertThat(passwordHasher.matches("senhaNova123", saved.getPasswordHash())).isTrue();
        assertThat(passwordHasher.matches("senhaAntiga1", saved.getPasswordHash())).isFalse();
        assertThat(codes.findByUserId(user.getId()).orElseThrow().getUsedAt())
                .isEqualTo(SENT_AT.plus(Duration.ofMinutes(2)));
        assertThat(tokenService.validateRefreshToken(phoneSession)).isEmpty();
    }

    @Test
    @DisplayName("reset: confirma o e-mail de quem ainda não tinha confirmado")
    void resetVerifiesEmail() {
        User user = User.register("Ana", Email.of("ana@gmail.com"), passwordHasher.hash("senhaAntiga1"),
                Currency.getInstance("BRL"));
        users.save(user);
        codes.save(PasswordResetCode.issue(user.getId(), CODE, SENT_AT));

        resetAt(Duration.ofMinutes(2)).execute(new ResetPasswordCommand("ana@gmail.com", CODE, "senhaNova123"));

        assertThat(users.findById(user.getId()).orElseThrow().isEmailVerified()).isTrue();
    }

    @Test
    @DisplayName("reset: código já usado → erro")
    void resetRejectsUsedCode() {
        userWithCode();
        resetAt(Duration.ofMinutes(2)).execute(new ResetPasswordCommand(EMAIL, CODE, "senhaNova123"));

        assertInvalidCode(() -> resetAt(Duration.ofMinutes(3))
                .execute(new ResetPasswordCommand(EMAIL, CODE, "outraSenha123")));
    }

    @Test
    @DisplayName("reset: código vencido (15 min) → erro e a senha não muda")
    void resetRejectsExpiredCode() {
        User user = userWithCode();

        assertInvalidCode(() -> resetAt(Duration.ofMinutes(15))
                .execute(new ResetPasswordCommand(EMAIL, CODE, "senhaNova123")));

        assertThat(passwordHasher.matches("senhaAntiga1", users.findById(user.getId()).orElseThrow()
                .getPasswordHash())).isTrue();
    }

    @Test
    @DisplayName("Depois de 5 tentativas erradas, nem o código certo funciona")
    void fiveWrongAttemptsInvalidateCode() {
        userWithCode();
        for (int i = 0; i < 5; i++) {
            assertInvalidCode(() -> verifyAt(Duration.ofMinutes(1)).execute(EMAIL, "000000"));
        }

        assertInvalidCode(() -> verifyAt(Duration.ofMinutes(1)).execute(EMAIL, CODE));
        assertInvalidCode(() -> resetAt(Duration.ofMinutes(1))
                .execute(new ResetPasswordCommand(EMAIL, CODE, "senhaNova123")));
    }

    @Test
    @DisplayName("E-mail sem conta → o mesmo erro do código errado")
    void unknownEmailGivesSameError() {
        assertInvalidCode(() -> verifyAt(Duration.ofMinutes(1)).execute("ninguem@gmail.com", CODE));
        assertInvalidCode(() -> resetAt(Duration.ofMinutes(1))
                .execute(new ResetPasswordCommand("ninguem@gmail.com", CODE, "senhaNova123")));
    }
}