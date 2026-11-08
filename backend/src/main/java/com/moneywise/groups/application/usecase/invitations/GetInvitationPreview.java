package com.moneywise.groups.application.usecase.invitations;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

import com.moneywise.groups.application.port.GroupInvitationRepository;
import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.application.port.MemberNameQuery;
import com.moneywise.groups.domain.Group;
import com.moneywise.groups.domain.GroupInvitation;
import com.moneywise.shared.exception.ResourceNotFoundException;

/** Consulta um convite pelo código. Convite aceito ou com mais de 7 dias responde 422. */
public class GetInvitationPreview {

    private final GroupInvitationRepository invitations;
    private final GroupRepository groups;
    private final MemberNameQuery names;
    private final Clock clock;

    public GetInvitationPreview(GroupInvitationRepository invitations, GroupRepository groups,
            MemberNameQuery names, Clock clock) {
        this.invitations = invitations;
        this.groups = groups;
        this.names = names;
        this.clock = clock;
    }

    public InvitationPreview execute(String code, UUID userId) {
        GroupInvitation invitation = invitations.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Convite não encontrado."));
        invitation.ensureUsable(clock.instant());
        Group group = groups.findById(invitation.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Convite não encontrado."));

        String invitedByName = names.findNamesByUserIds(List.of(invitation.getInvitedBy()))
                .get(invitation.getInvitedBy());
        return new InvitationPreview(invitation.getCode(), group.getId(), group.getName(), invitedByName,
                group.getMembers().size(), invitation.getExpiresAt(), group.isMember(userId));
    }
}
