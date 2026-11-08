package com.moneywise.groups.presentation.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.moneywise.groups.application.usecase.GroupView;

/** Representação REST do grupo; membros ordenados por data de entrada. */
public record GroupResponseDTO(
        UUID id,
        String name,
        UUID adminId,
        Instant createdAt,
        List<GroupMemberResponseDTO> members) {

    public static GroupResponseDTO from(GroupView view) {
        var group = view.group();
        List<GroupMemberResponseDTO> members = group.getMembers().stream()
                .map(member -> new GroupMemberResponseDTO(member.userId(), view.nameOf(member.userId()),
                        member.role(), member.joinedAt()))
                .toList();
        return new GroupResponseDTO(group.getId(), group.getName(), group.getAdminId(), group.getCreatedAt(),
                members);
    }
}
