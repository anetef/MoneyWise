package com.moneywise.groups.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ForbiddenOperationException;
import com.moneywise.shared.exception.ResourceNotFoundException;

/** Aggregate que mantém os membros e o único Admin do grupo. */
public final class Group {

    private static final String ADMIN_REQUIRED_CODE = "GROUP_ADMIN_REQUIRED";
    private static final String LAST_MEMBER_CANNOT_LEAVE_CODE = "GROUP_LAST_MEMBER_CANNOT_LEAVE";

    private final UUID id;
    private final String name;
    private final Instant createdAt;
    private final List<GroupMember> members;

    private Group(UUID id, String name, Instant createdAt, List<GroupMember> members) {
        this.id = Objects.requireNonNull(id, "id não pode ser nulo");
        this.name = normalizeName(name);
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt não pode ser nulo");
        this.members = validateMembers(members);
    }

    public static Group create(UUID id, String name, UUID adminId, Instant createdAt) {
        Objects.requireNonNull(adminId, "adminId não pode ser nulo");
        GroupMember admin = new GroupMember(adminId, Role.ADMIN, createdAt);
        return new Group(id, name, createdAt, List.of(admin));
    }

    public static Group restore(UUID id, String name, Instant createdAt, List<GroupMember> members) {
        return new Group(id, name, createdAt, members);
    }

    public static Group restore(UUID id, String name, UUID adminId, Instant createdAt, List<GroupMember> members) {
        Group group = new Group(id, name, createdAt, members);
        if (!group.isAdmin(adminId)) {
            throw new IllegalArgumentException("admin_id precisa corresponder ao membro com papel ADMIN.");
        }
        return group;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public List<GroupMember> getMembers() {
        return members;
    }

    public UUID getAdminId() {
        return members.stream()
                .filter(member -> member.role() == Role.ADMIN)
                .map(GroupMember::userId)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Grupo persistido precisa ter um Admin."));
    }

    public boolean isMember(UUID userId) {
        return members.stream().anyMatch(member -> member.userId().equals(userId));
    }

    public boolean isAdmin(UUID userId) {
        return members.stream().anyMatch(member -> member.userId().equals(userId) && member.role() == Role.ADMIN);
    }

    public Group addMember(UUID userId, Instant joinedAt) {
        Objects.requireNonNull(userId, "userId não pode ser nulo");
        if (isMember(userId)) {
            throw new BusinessRuleException("GROUP_MEMBER_ALREADY_EXISTS", "Este usuário já participa do grupo.");
        }
        List<GroupMember> updated = new ArrayList<>(members);
        updated.add(new GroupMember(userId, Role.MEMBER, joinedAt));
        return new Group(id, name, createdAt, updated);
    }

    /** RN04: somente o Admin pode alterar o valor da meta do grupo. */
    public void ensureCanChangeGoalTarget(UUID actorId) {
        ensureAdmin(actorId, "Somente o Admin pode alterar o valor da meta.");
    }

    /** RN04: somente o Admin pode remover membros; se remover a si mesmo, aplica L-10. */
    public Group removeMember(UUID actorId, UUID memberId) {
        ensureAdmin(actorId, "Somente o Admin pode remover membros.");
        GroupMember target = members.stream()
                .filter(member -> member.userId().equals(memberId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Membro não encontrado neste grupo."));

        List<GroupMember> remaining = new ArrayList<>(members);
        remaining.remove(target);
        if (target.role() == Role.ADMIN) {
            if (remaining.isEmpty()) {
                throw new BusinessRuleException(LAST_MEMBER_CANNOT_LEAVE_CODE,
                        "O Admin não pode sair enquanto for o único membro do grupo.");
            }
            GroupMember successor = remaining.stream()
                    .min(Comparator.comparing(GroupMember::joinedAt).thenComparing(GroupMember::userId))
                    .orElseThrow();
            remaining.replaceAll(member -> member.userId().equals(successor.userId())
                    ? member.promoteToAdmin()
                    : member.demoteToMember());
        }
        return new Group(id, name, createdAt, remaining);
    }

    public Optional<GroupMember> findMember(UUID userId) {
        return members.stream().filter(member -> member.userId().equals(userId)).findFirst();
    }

    private void ensureAdmin(UUID actorId, String message) {
        if (!isAdmin(actorId)) {
            throw new ForbiddenOperationException(ADMIN_REQUIRED_CODE, message);
        }
    }

    private static List<GroupMember> validateMembers(List<GroupMember> members) {
        Objects.requireNonNull(members, "members não pode ser nulo");
        List<GroupMember> copy = List.copyOf(members);
        long admins = copy.stream().filter(member -> member.role() == Role.ADMIN).count();
        boolean duplicateUsers = copy.stream().map(GroupMember::userId).distinct().count() != copy.size();
        if (copy.isEmpty() || admins != 1 || duplicateUsers) {
            throw new IllegalArgumentException("O grupo deve ter membros únicos e exatamente um Admin.");
        }
        return copy;
    }

    private static String normalizeName(String name) {
        Objects.requireNonNull(name, "name não pode ser nulo");
        String normalized = name.trim();
        if (normalized.isEmpty() || normalized.length() > 100) {
            throw new IllegalArgumentException("O nome do grupo deve ter entre 1 e 100 caracteres.");
        }
        return normalized;
    }
}
