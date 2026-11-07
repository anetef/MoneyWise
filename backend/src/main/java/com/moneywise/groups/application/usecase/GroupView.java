package com.moneywise.groups.application.usecase;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import com.moneywise.groups.application.port.MemberNameQuery;
import com.moneywise.groups.domain.Group;

/** Grupo acompanhado do nome de exibição dos membros, para as telas de Caixinhas. */
public record GroupView(Group group, Map<UUID, String> memberNames) {

    public GroupView {
        Objects.requireNonNull(group, "group não pode ser nulo");
        memberNames = Map.copyOf(Objects.requireNonNull(memberNames, "memberNames não pode ser nulo"));
    }

    public static GroupView of(Group group, MemberNameQuery names) {
        var ids = group.getMembers().stream().map(member -> member.userId()).toList();
        return new GroupView(group, names.findNamesByUserIds(ids));
    }

    public String nameOf(UUID userId) {
        return memberNames.get(userId);
    }
}
