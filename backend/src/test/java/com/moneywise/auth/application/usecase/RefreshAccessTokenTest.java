package com.moneywise.auth.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.shared.exception.UnauthorizedException;

class RefreshAccessTokenTest {

    private final FakeRefreshTokenService tokenService = new FakeRefreshTokenService();
    private final RefreshAccessToken refreshAccessToken = new RefreshAccessToken(tokenService);
    private final UUID userId = UUID.randomUUID();

    @Test
    @DisplayName("Refresh válido devolve novo access token e novo refresh token")
    void shouldIssueNewTokens() {
        String oldRefresh = tokenService.issueRefreshToken(userId);

        AuthTokens tokens = refreshAccessToken.execute(oldRefresh);

        assertThat(tokens.accessToken()).isNotBlank();
        assertThat(tokens.refreshToken()).isNotBlank().isNotEqualTo(oldRefresh);
        assertThat(tokenService.validateRefreshToken(tokens.refreshToken())).hasValue(userId);
    }

    @Test
    @DisplayName("Rotação: o refresh token usado deixa de valer")
    void shouldRevokeUsedToken() {
        String oldRefresh = tokenService.issueRefreshToken(userId);
        refreshAccessToken.execute(oldRefresh);

        assertThatThrownBy(() -> refreshAccessToken.execute(oldRefresh))
                .isInstanceOf(UnauthorizedException.class)
                .hasFieldOrPropertyWithValue("code", RefreshAccessToken.INVALID_REFRESH_TOKEN);
    }

    @Test
    @DisplayName("Refresh desconhecido → 401")
    void shouldRejectUnknownToken() {
        assertThatThrownBy(() -> refreshAccessToken.execute("token-que-nao-existe"))
                .isInstanceOf(UnauthorizedException.class)
                .hasFieldOrPropertyWithValue("code", RefreshAccessToken.INVALID_REFRESH_TOKEN);
    }

    @Test
    @DisplayName("Refresh vazio ou nulo → 401")
    void shouldRejectBlankToken() {
        assertThatThrownBy(() -> refreshAccessToken.execute(""))
                .isInstanceOf(UnauthorizedException.class);
        assertThatThrownBy(() -> refreshAccessToken.execute(null))
                .isInstanceOf(UnauthorizedException.class);
    }
}
