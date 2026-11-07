package com.moneywise.groups.presentation.dto;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Corpo de criação; o ID é gerado no cliente para suportar sincronização idempotente. */
public record CreateGroupRequestDTO(
        @Schema(description = "UUID gerado no app; reenviar o mesmo ID não duplica o grupo")
        @NotNull UUID id,
        @Schema(description = "Nome do grupo ou da Caixinha", example = "Viagem de fim de ano", maxLength = 100)
        @NotBlank @Size(max = 100) String name) {
}
