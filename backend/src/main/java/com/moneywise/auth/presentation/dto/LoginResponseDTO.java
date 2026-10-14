package com.moneywise.auth.presentation.dto;


import com.moneywise.auth.application.usecase.LoginResult;

/** Resposta do login: os tokens e os dados básicos do usuário (SEC-06). */
public record LoginResponseDTO(String accessToken, String refreshToken, String tokenType, UserResponseDTO user) {

    public static LoginResponseDTO from(LoginResult result) {
        return new LoginResponseDTO(
                result.accessToken(),
                result.refreshToken(),
                "Bearer",
                UserResponseDTO.from(result.user()));
    }
}