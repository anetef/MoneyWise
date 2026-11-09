package com.moneywise.groups.application.usecase.invitations;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

import com.moneywise.groups.application.port.GroupInvitationRepository;
import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.application.port.MemberNameQuery;
import com.moneywise.groups.application.usecase.GroupView;
import com.moneywise.groups.domain.Group;
import com.moneywise.groups.domain.GroupInvitation;
import com.moneywise.groups.domain.GroupMember;
import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ResourceNotFoundException;

/**
 * Aceita um convite de uso único (L-05) e inclui o usuário como membro comum. Quem já participa do grupo
 * recebe o grupo sem efeito colateral: não duplica o membro e o convite continua pendente para outra pessoa.
 */
public class AcceptGroupInvitation {

    private final GroupInvitationRepository invitations;
    private final GroupRepository groups;
    private final MemberNameQuery names;
    private final Clock clock;

    public AcceptGroupInvitation(GroupInvitationRepository invitations, GroupRepository groups,
            MemberNameQuery names, Clock clock) {
        this.invitations = invitations;
        this.groups = groups;
        this.names = names;
        this.clock = clock;
    }

    public GroupView execute(String code, UUID userId) {
        GroupInvitation invitation = invitations.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Convite não encontrado."));
        Group group = groups.findById(invitation.getGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Convite não encontrado."));
        if (group.isMember(userId)) {
            return GroupView.of(group, names);
        }

        Instant now = clock.instant();
        invitation.accept(now);
        GroupMember newMember = group.addMember(userId, now).findMember(userId).orElseThrow();
        if (!invitations.acceptAndAddMember(invitation.getId(), group.getId(), newMember)) {
            throw new BusinessRuleException("GROUP_INVITATION_NOT_PENDING", "Este convite não está pendente.");
        }

        Group updated = groups.findById(group.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Grupo não encontrado."));
        return GroupView.of(updated, names);
    }
}
