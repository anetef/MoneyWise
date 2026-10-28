package com.moneywise.groups.infrastructure.persistence;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/** Chave composta da associação entre grupo e usuário. */
public class GroupMemberId implements Serializable {

    private UUID groupId;
    private UUID userId;

    public GroupMemberId() {
    }

    public GroupMemberId(UUID groupId, UUID userId) {
        this.groupId = groupId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof GroupMemberId that)) return false;
        return Objects.equals(groupId, that.groupId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(groupId, userId);
    }
}
