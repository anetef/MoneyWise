package com.moneywise.groups.application.usecase.members;

import java.util.UUID;

import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.domain.Group;
import com.moneywise.shared.exception.ResourceNotFoundException;

/**
 * Remove um membro do grupo (RN04/RF-12). Somente o Admin remove; se o Admin remover a si mesmo, o membro
 * mais antigo assume (L-10). Quem não participa do grupo recebe 404.
 */
public class RemoveGroupMember {

    private final GroupRepository groups;

    public RemoveGroupMember(GroupRepository groups) {
        this.groups = groups;
    }

    public void execute(UUID groupId, UUID actorId, UUID memberId) {
        Group group = groups.findById(groupId)
                .filter(candidate -> candidate.isMember(actorId))
                .orElseThrow(() -> new ResourceNotFoundException("Grupo não encontrado."));
        groups.save(group.removeMember(actorId, memberId));
    }
}
