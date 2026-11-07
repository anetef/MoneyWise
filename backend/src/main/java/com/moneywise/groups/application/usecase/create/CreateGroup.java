package com.moneywise.groups.application.usecase.create;

import java.time.Clock;
import java.util.List;

import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.application.port.MemberNameQuery;
import com.moneywise.groups.application.usecase.GroupView;
import com.moneywise.groups.domain.Group;
import com.moneywise.shared.exception.ResourceNotFoundException;

/**
 * Cria um grupo com o criador como Admin (RF-11). O ID vem do cliente: reenvio do mesmo ID por quem já
 * participa do grupo devolve o grupo existente, sem duplicar (seção 6.4). ID de grupo alheio responde 404,
 * como nas transações, para não revelar que o grupo existe.
 */
public class CreateGroup {

    private final GroupRepository groups;
    private final MemberNameQuery names;
    private final Clock clock;

    public CreateGroup(GroupRepository groups, MemberNameQuery names, Clock clock) {
        this.groups = groups;
        this.names = names;
        this.clock = clock;
    }

    public GroupView execute(CreateGroupCommand command) {
        var existing = groups.findById(command.id());
        if (existing.isPresent()) {
            Group group = existing.get();
            if (!group.isMember(command.userId())) {
                throw new ResourceNotFoundException("Grupo não encontrado.");
            }
            return GroupView.of(group, names);
        }

        if (names.findNamesByUserIds(List.of(command.userId())).isEmpty()) {
            throw new ResourceNotFoundException("Usuário não encontrado.");
        }

        Group group = Group.create(command.id(), command.name(), command.userId(), clock.instant());
        return GroupView.of(groups.save(group), names);
    }
}
