package com.moneywise.groups.application.usecase.query;

import java.util.UUID;

import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.application.port.MemberNameQuery;
import com.moneywise.groups.application.usecase.GroupView;
import com.moneywise.shared.exception.ResourceNotFoundException;

/** Detalha um grupo apenas para seus membros; para os demais, o grupo não existe (404). */
public class GetGroup {

    private final GroupRepository groups;
    private final MemberNameQuery names;

    public GetGroup(GroupRepository groups, MemberNameQuery names) {
        this.groups = groups;
        this.names = names;
    }

    public GroupView execute(UUID groupId, UUID userId) {
        return groups.findById(groupId)
                .filter(group -> group.isMember(userId))
                .map(group -> GroupView.of(group, names))
                .orElseThrow(() -> new ResourceNotFoundException("Grupo não encontrado."));
    }
}
