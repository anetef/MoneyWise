package com.moneywise.groups.application.usecase.query;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.application.port.MemberNameQuery;
import com.moneywise.groups.application.usecase.GroupView;
import com.moneywise.groups.domain.Group;

/** Lista somente os grupos e Caixinhas de que o usuário participa (L-09). */
public class ListGroups {

    private final GroupRepository groups;
    private final MemberNameQuery names;

    public ListGroups(GroupRepository groups, MemberNameQuery names) {
        this.groups = groups;
        this.names = names;
    }

    public List<GroupView> execute(UUID userId) {
        List<Group> memberOf = groups.findAllByMemberId(userId);
        List<UUID> userIds = memberOf.stream()
                .flatMap(group -> group.getMembers().stream())
                .map(member -> member.userId())
                .distinct()
                .toList();
        Map<UUID, String> allNames = names.findNamesByUserIds(userIds);
        return memberOf.stream()
                .map(group -> new GroupView(group, namesOfMembers(group, allNames)))
                .toList();
    }

    private static Map<UUID, String> namesOfMembers(Group group, Map<UUID, String> allNames) {
        return allNames.entrySet().stream()
                .filter(entry -> group.isMember(entry.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }
}
