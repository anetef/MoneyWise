package com.moneywise.groups.application.usecase.members;

import java.util.UUID;

import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.domain.Group;
import com.moneywise.shared.exception.ResourceNotFoundException;

/**
 * O próprio membro sai do grupo (L-09). Se for o Admin, o membro mais antigo assume (L-10). O único membro
 * não pode sair (422 GROUP_LAST_MEMBER_CANNOT_LEAVE).
 */
public class LeaveGroup {

    private final GroupRepository groups;

    public LeaveGroup(GroupRepository groups) {
        this.groups = groups;
    }

    public void execute(UUID groupId, UUID userId) {
        Group group = groups.findById(groupId)
                .filter(candidate -> candidate.isMember(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Grupo não encontrado."));
        groups.save(group.leave(userId));
    }
}
