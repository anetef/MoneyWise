package com.moneywise.auth.application.usecase;

import java.util.UUID;

import com.moneywise.auth.application.port.TokenService;
import com.moneywise.shared.exception.UnauthorizedException;

public class RefreshAccessToken {

    public static final String INVALID_REFRESH_TOKEN = "INVALID_REFRESH_TOKEN";

    private final TokenService tokenService;

    public RefreshAccessToken(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    public AuthTokens execute(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw invalidRefreshToken();
        }

        UUID userId = tokenService.validateRefreshToken(refreshToken)
                .orElseThrow(RefreshAccessToken::invalidRefreshToken);

        tokenService.revokeRefreshToken(refreshToken);

        String newAccessToken = tokenService.issueAccessToken(userId);
        String newRefreshToken = tokenService.issueRefreshToken(userId);
        return new AuthTokens(newAccessToken, newRefreshToken);
    }

    private static UnauthorizedException invalidRefreshToken() {
        return new UnauthorizedException(INVALID_REFRESH_TOKEN, "Sessão expirada. Faça login novamente.");
    }
}