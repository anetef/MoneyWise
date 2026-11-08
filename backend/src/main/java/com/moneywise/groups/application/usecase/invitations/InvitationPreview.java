package com.moneywise.groups.application.usecase.invitations;

import java.time.Instant;
import java.util.UUID;

/**
 * O que quem recebeu o convite vê antes de aceitar: nome do grupo, quem convidou, quantos membros há e a
 * validade. Não inclui a lista de membros nem nenhum dado financeiro.
 */
public record InvitationPreview(String code, UUID groupId, String groupName, String invitedByName,
        int memberCount, Instant expiresAt, boolean alreadyMember) {
}
