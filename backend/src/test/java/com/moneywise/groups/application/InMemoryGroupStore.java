package com.moneywise.groups.application;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.groups.application.port.GroupInvitationRepository;
import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.application.port.MemberNameQuery;
import com.moneywise.groups.domain.Group;
import com.moneywise.groups.domain.GroupInvitation;
import com.moneywise.groups.domain.GroupInvitationStatus;
import com.moneywise.groups.domain.GroupMember;

/** Fakes em memória dos ports de grupos, convites e nomes, para os testes dos casos de uso. */
final class InMemoryGroupStore implements GroupRepository, GroupInvitationRepository, MemberNameQuery {

    final Map<UUID, Group> groups = new LinkedHashMap<>();
    final Map<String, GroupInvitation> invitations = new HashMap<>();
    final Map<UUID, String> userNames = new HashMap<>();
    int groupSaves;

    UUID newUser(String name) {
        UUID id = UUID.randomUUID();
        userNames.put(id, name);
        return id;
    }

    @Override
    public Group save(Group group) {
        groupSaves++;
        groups.put(group.getId(), group);
        return group;
    }

    @Override
    public Optional<Group> findById(UUID id) {
        return Optional.ofNullable(groups.get(id));
    }

    @Override
    public List<Group> findAllByMemberId(UUID userId) {
        return groups.values().stream()
                .filter(group -> group.isMember(userId))
                .sorted(Comparator.comparing(Group::getCreatedAt).thenComparing(Group::getId))
                .toList();
    }

    @Override
    public GroupInvitation save(GroupInvitation invitation) {
        invitations.put(invitation.getCode(), invitation);
        return invitation;
    }

    @Override
    public Optional<GroupInvitation> findByCode(String code) {
        return Optional.ofNullable(invitations.get(code));
    }

    @Override
    public boolean acceptAndAddMember(UUID invitationId, UUID groupId, GroupMember member) {
        GroupInvitation invitation = invitations.values().stream()
                .filter(candidate -> candidate.getId().equals(invitationId))
                .findFirst()
                .orElseThrow();
        if (invitation.getStatus() != GroupInvitationStatus.PENDING) {
            return false;
        }
        invitations.put(invitation.getCode(), GroupInvitation.restore(invitation.getId(), invitation.getCode(),
                invitation.getGroupId(), invitation.getInvitedBy(), invitation.getCreatedAt(),
                invitation.getExpiresAt(), GroupInvitationStatus.ACCEPTED));
        Group group = groups.get(groupId);
        if (!group.isMember(member.userId())) {
            List<GroupMember> members = new ArrayList<>(group.getMembers());
            members.add(member);
            groups.put(groupId, Group.restore(groupId, group.getName(), group.getCreatedAt(), members));
        }
        return true;
    }

    @Override
    public Map<UUID, String> findNamesByUserIds(Collection<UUID> userIds) {
        Map<UUID, String> found = new HashMap<>();
        for (UUID id : userIds) {
            if (userNames.containsKey(id)) {
                found.put(id, userNames.get(id));
            }
        }
        return found;
    }
}
