package com.moneywise.groups.application.usecase.create;

import java.util.UUID;

/** Dados para criar um grupo; o criador é obtido do access token. */
public record CreateGroupCommand(UUID id, UUID userId, String name) {
}
