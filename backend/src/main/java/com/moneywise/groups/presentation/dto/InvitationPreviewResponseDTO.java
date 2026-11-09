package com.moneywise.groups.presentation.dto;

import java.time.Instant;
import java.util.UUID;

import com.moneywise.groups.application.usecase.invitations.InvitationPreview;

/** Prévia do convite mostrada antes do aceite; não inclui membros nem dados financeiros. */
public record InvitationPreviewResponseDTO(
        String code,
        UUID groupId,
        String groupName,
        String invitedByName,
        int memberCount,
        Instant expiresAt,
        boolean alreadyMember) {

    public static InvitationPreviewResponseDTO from(InvitationPreview preview) {
        return new InvitationPreviewResponseDTO(preview.code(), preview.groupId(), preview.groupName(),
                preview.invitedByName(), preview.memberCount(), preview.expiresAt(), preview.alreadyMember());
    }
}
