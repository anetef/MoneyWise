package com.moneywise.groups.application.usecase.invitations;

import java.time.Clock;
import java.util.UUID;

import com.moneywise.groups.application.port.GroupInvitationRepository;
import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.application.port.InvitationCodeGenerator;
import com.moneywise.groups.domain.Group;
import com.moneywise.groups.domain.GroupInvitation;
import com.moneywise.shared.exception.ResourceNotFoundException;

/**
 * Gera um convite de uso único, válido por 7 dias (L-05). Somente o Admin convida (L-10); quem não participa
 * do grupo recebe 404 e membro comum recebe 403.
 */
public class CreateGroupInvitation {

    private final GroupRepository groups;
    private final GroupInvitationRepository invitations;
    private final InvitationCodeGenerator codes;
    private final Clock clock;

    public CreateGroupInvitation(GroupRepository groups, GroupInvitationRepository invitations,
            InvitationCodeGenerator codes, Clock clock) {
        this.groups = groups;
        this.invitations = invitations;
        this.codes = codes;
        this.clock = clock;
    }

    public GroupInvitation execute(UUID groupId, UUID actorId) {
        Group group = groups.findById(groupId)
                .filter(candidate -> candidate.isMember(actorId))
                .orElseThrow(() -> new ResourceNotFoundException("Grupo não encontrado."));
        group.ensureCanInvite(actorId);

        GroupInvitation invitation = GroupInvitation.create(UUID.randomUUID(), codes.generate(), groupId, actorId,
                clock.instant());
        return invitations.save(invitation);
    }
}
