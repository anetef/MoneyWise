package com.moneywise.auth.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.auth.application.usecase.session.Logout;

class LogoutTest {

    private final FakeRefreshTokenService tokenService = new FakeRefreshTokenService();
    private final Logout logout = new Logout(tokenService);

    @Test
    @DisplayName("Depois do logout, o refresh token deixa de valer")
    void shouldRevokeRefreshToken() {
        String refreshToken = tokenService.issueRefreshToken(UUID.randomUUID());

        logout.execute(refreshToken);

        assertThat(tokenService.validateRefreshToken(refreshToken)).isEmpty();
    }

    @Test
    @DisplayName("Logout com token desconhecido, repetido ou vazio não dá erro")
    void shouldNotFailForUnknownToken() {
        String refreshToken = tokenService.issueRefreshToken(UUID.randomUUID());
        logout.execute(refreshToken);

        assertThatCode(() -> logout.execute(refreshToken)).doesNotThrowAnyException();
        assertThatCode(() -> logout.execute("token-que-nao-existe")).doesNotThrowAnyException();
        assertThatCode(() -> logout.execute(null)).doesNotThrowAnyException();
    }
}