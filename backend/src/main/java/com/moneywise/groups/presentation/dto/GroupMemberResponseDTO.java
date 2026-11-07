package com.moneywise.groups.presentation.dto;

import java.time.Instant;
import java.util.UUID;

import com.moneywise.groups.domain.Role;

/** Participante do grupo: apenas identificação, papel e data de entrada; nenhum dado financeiro pessoal. */
public record GroupMemberResponseDTO(UUID userId, String name, Role role, Instant joinedAt) {
}
