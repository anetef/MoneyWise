package com.moneywise.auth.presentation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/** Corpo do POST /api/v1/auth/login. */
public record LoginRequestDTO(

        @Schema(example = "maria@gmail.com")
        @NotBlank(message = "O e-mail é obrigatório.")
        String email,

        @Schema(example = "senhaSegura123")
        @NotBlank(message = "A senha é obrigatória.")
        String password) {
}