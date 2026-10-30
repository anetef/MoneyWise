package com.moneywise.groups.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Currency;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import com.moneywise.TestcontainersConfiguration;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;
import com.moneywise.groups.application.GroupAuthorizationService;
import com.moneywise.groups.application.port.GroupMemberRepository;
import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.domain.Group;
import com.moneywise.groups.domain.Role;

import jakarta.persistence.EntityManager;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class GroupPersistenceIntegrationTest {

    @Autowired private GroupRepository groups;
    @Autowired private GroupMemberRepository members;
    @Autowired private GroupAuthorizationService authorization;
    @Autowired private UserRepository users;
    @Autowired private EntityManager entityManager;
    @Autowired private JdbcTemplate jdbc;

    private User newUser(String email) {
        return users.save(User.register("Pessoa", Email.of(email), "hash-da-senha", Currency.getInstance("BRL")));
    }

    @Test
    @DisplayName("Persiste e recupera grupo, membros, papéis e ordem de entrada")
    void savesAndFindsGroupAndMembers() {
        User admin = newUser("grp01-admin@example.com");
        User member = newUser("grp01-member@example.com");
        Instant joinedAt = Instant.parse("2026-01-02T10:00:00Z");
        Group expected = Group.create(UUID.randomUUID(), "Família", admin.getId(), joinedAt)
                .addMember(member.getId(), joinedAt.plusSeconds(5));

        groups.save(expected);
        entityManager.flush();
        entityManager.clear();

        Group actual = groups.findById(expected.getId()).orElseThrow();
        assertThat(actual.getName()).isEqualTo("Família");
        assertThat(actual.getAdminId()).isEqualTo(admin.getId());
        assertThat(actual.getMembers()).extracting(memberRow -> memberRow.role())
                .containsExactly(Role.ADMIN, Role.MEMBER);
        assertThat(members.findByGroupId(expected.getId())).hasSize(2);
        assertThat(authorization.isAdmin(expected.getId(), admin.getId())).isTrue();
        assertThat(authorization.isMember(expected.getId(), member.getId())).isTrue();
        assertThat(authorization.isMember(expected.getId(), UUID.randomUUID())).isFalse();
    }

    @Test
    @DisplayName("Persiste a promoção do membro mais antigo quando o Admin sai")
    void persistsOldestMemberPromotionWhenAdminLeaves() {
        User admin = newUser("grp01-promotion-admin@example.com");
        User oldest = newUser("grp01-promotion-oldest@example.com");
        User newer = newUser("grp01-promotion-newer@example.com");
        Instant joinedAt = Instant.parse("2026-02-01T10:00:00Z");
        Group group = Group.create(UUID.randomUUID(), "Promoção", admin.getId(), joinedAt)
                .addMember(newer.getId(), joinedAt.plusSeconds(20))
                .addMember(oldest.getId(), joinedAt.plusSeconds(10));
        groups.save(group);
        entityManager.flush();
        entityManager.clear();

        Group afterAdminLeaves = groups.findById(group.getId()).orElseThrow()
                .removeMember(admin.getId(), admin.getId());
        groups.save(afterAdminLeaves);
        entityManager.flush();
        entityManager.clear();

        Group persisted = groups.findById(group.getId()).orElseThrow();
        assertThat(persisted.getAdminId()).isEqualTo(oldest.getId());
        assertThat(persisted.getMembers()).hasSize(2);
        assertThat(persisted.isMember(admin.getId())).isFalse();
        assertThat(authorization.isAdmin(group.getId(), oldest.getId())).isTrue();
        assertThat(authorization.isAdmin(group.getId(), newer.getId())).isFalse();
    }

    @Test
    @DisplayName("Convite aceita prazo calculado pela aplicação e exige código único")
    void invitationExpirationIsProvidedByApplicationAndCodeIsUnique() {
        User admin = newUser("grp01-invite-admin@example.com");
        UUID groupId = UUID.randomUUID();
        groups.save(Group.create(groupId, "Convites", admin.getId(), Instant.now()));
        entityManager.flush();
        UUID invitationId = UUID.randomUUID();
        String code = "GRP01-" + UUID.randomUUID();

        Instant createdAt = Instant.parse("2026-03-01T10:00:00Z");
        Instant expiresAt = createdAt.plusSeconds(14L * 24 * 60 * 60);
        jdbc.update("INSERT INTO group_invitations (id, code, group_id, invited_by, created_at, expires_at) "
                        + "VALUES (?, ?, ?, ?, ?, ?)",
                invitationId, code, groupId, admin.getId(), Timestamp.from(createdAt), Timestamp.from(expiresAt));

        Boolean expirationWasStored = jdbc.queryForObject(
                "SELECT expires_at = ? FROM group_invitations WHERE id = ?",
                Boolean.class, Timestamp.from(expiresAt), invitationId);
        assertThat(expirationWasStored).isTrue();
        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO group_invitations (id, code, group_id, invited_by, expires_at) VALUES (?, ?, ?, ?, ?)",
                UUID.randomUUID(), code, groupId, admin.getId(), Timestamp.from(expiresAt)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Banco impede que o mesmo usuário entre duas vezes no grupo")
    void membershipPrimaryKeyRejectsDuplicateUser() {
        User admin = newUser("grp01-duplicate-member@example.com");
        UUID groupId = UUID.randomUUID();
        groups.save(Group.create(groupId, "Sem duplicidade", admin.getId(), Instant.now()));
        entityManager.flush();

        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)",
                groupId, admin.getId(), "MEMBER"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Banco aceita somente os papéis ADMIN e MEMBER")
    void membershipRejectsUnknownRole() {
        User admin = newUser("grp01-role-admin@example.com");
        User other = newUser("grp01-role-other@example.com");
        UUID groupId = UUID.randomUUID();
        groups.save(Group.create(groupId, "Papéis", admin.getId(), Instant.now()));
        entityManager.flush();

        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)",
                groupId, other.getId(), "OBSERVER"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
