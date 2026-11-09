package com.moneywise.groups.presentation.dto;

import java.time.Instant;
import java.util.UUID;

import com.moneywise.groups.domain.GroupInvitation;

/** Convite gerado: o app compartilha o código como link, WhatsApp ou QR Code. */
public record GroupInvitationResponseDTO(UUID id, String code, UUID groupId, Instant expiresAt) {

    public static GroupInvitationResponseDTO from(GroupInvitation invitation) {
        return new GroupInvitationResponseDTO(invitation.getId(), invitation.getCode(), invitation.getGroupId(),
                invitation.getExpiresAt());
    }
}
