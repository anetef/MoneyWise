package com.moneywise.auth.presentation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Corpo do POST /api/v1/auth/register. */
public record RegisterRequestDTO (

    @Schema(example = "Maria Silva")
        @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        String name,

        @Schema(example = "maria@gmail.com")
        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "E-mail inválido.")
        @Size(max = 254, message = "O e-mail deve ter no máximo 254 caracteres.")
        String email,

        @Schema(example = "senhaSegura123")
        @NotBlank(message = "A senha é obrigatória.")
        @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres.")
        String password,

        @Schema(example = "BRL", description = "Código ISO 4217 da moeda (RN09)")
        @NotBlank(message = "A moeda é obrigatória.")
        @Pattern (regexp = "^[A-Z]{3}$", message = "A moeda deve ter 3 letras maiúsculas, como BRL.")
        String currency) {
        
}
