package com.moneywise.auth.presentation.dto;

import com.moneywise.auth.application.usecase.session.AuthTokens;

public record TokenResponseDTO(String accessToken, String refreshToken, String tokenType) {

    public static TokenResponseDTO from(AuthTokens tokens) {
        return new TokenResponseDTO(tokens.accessToken(), tokens.refreshToken(), "Bearer");
    }
}