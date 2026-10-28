package com.moneywise.groups.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/** Participação de uma pessoa em um grupo. */
public record GroupMember(UUID userId, Role role, Instant joinedAt) {

    public GroupMember {
        Objects.requireNonNull(userId, "userId não pode ser nulo");
        Objects.requireNonNull(role, "role não pode ser nulo");
        Objects.requireNonNull(joinedAt, "joinedAt não pode ser nulo");
    }

    GroupMember promoteToAdmin() {
        return new GroupMember(userId, Role.ADMIN, joinedAt);
    }

    GroupMember demoteToMember() {
        return new GroupMember(userId, Role.MEMBER, joinedAt);
    }
}
