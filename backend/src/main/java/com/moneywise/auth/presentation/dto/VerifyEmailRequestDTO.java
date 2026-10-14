package com.moneywise.auth.presentation.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyEmailRequestDTO(
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "\\d{6}", message = "O código deve ter 6 dígitos.") String code
) {
}
