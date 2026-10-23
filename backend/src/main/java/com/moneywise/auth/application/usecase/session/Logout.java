package com.moneywise.auth.application.usecase.session;

import com.moneywise.auth.application.port.TokenService;

public class Logout {

    private final TokenService tokenService;

    public Logout(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    public void execute(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        tokenService.revokeRefreshToken(refreshToken);
    }
}