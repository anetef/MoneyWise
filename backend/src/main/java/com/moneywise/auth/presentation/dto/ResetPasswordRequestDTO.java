package com.moneywise.auth.presentation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequestDTO(
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "\\d{6}", message = "O código deve ter 6 dígitos.") String code,
        @Schema(example = "novaSenhaSegura123")
        @NotBlank(message = "A senha é obrigatória.")
        @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres.")
        String newPassword
) {
}