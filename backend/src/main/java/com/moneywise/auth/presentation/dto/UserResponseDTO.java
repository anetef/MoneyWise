package com.moneywise.auth.presentation.dto;

import java.util.UUID;

import com.moneywise.auth.domain.User;

/** Dados do usuário devolvidos pela API. Nunca inclui o hash da senha. */
public record UserResponseDTO(UUID id, String name, String email, String currency, boolean emailVerified) {

    public static UserResponseDTO from(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail().value(),
                user.getCurrency().getCurrencyCode(),
                user.isEmailVerified());
    }
}
