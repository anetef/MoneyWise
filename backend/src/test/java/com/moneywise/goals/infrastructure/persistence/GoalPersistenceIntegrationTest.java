package com.moneywise.goals.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.time.LocalDate;
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
import com.moneywise.goals.application.port.ContributionRepository;
import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.domain.Contribution;
import com.moneywise.goals.domain.ContributionType;
import com.moneywise.goals.domain.Goal;
import com.moneywise.goals.domain.MemberTotal;
import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.domain.Group;
import com.moneywise.shared.money.Money;

import jakarta.persistence.EntityManager;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class GoalPersistenceIntegrationTest {

    private static final Instant NOW = Instant.parse("2026-11-01T12:00:00Z");

    @Autowired private GoalRepository goals;
    @Autowired private ContributionRepository contributions;
    @Autowired private GroupRepository groups;
    @Autowired private UserRepository users;
    @Autowired private EntityManager entityManager;
    @Autowired private JdbcTemplate jdbc;

    // ---------- Auxiliares ----------

    private UUID newUser(String name) {
        User user = User.register(name, Email.of("goal01-" + UUID.randomUUID() + "@example.com"), "hash-da-senha",
                Currency.getInstance("BRL"));
        return users.save(user).getId();
    }

    private UUID newGroup(UUID adminId) {
        UUID groupId = UUID.randomUUID();
        groups.save(Group.create(groupId, "Família", adminId, NOW));
        return groupId;
    }

    private Goal newGoal(UUID groupId) {
        return goals.save(Goal.create(UUID.randomUUID(), groupId, "Viagem", Money.of("1000.00", "BRL"),
                LocalDate.of(2027, 6, 30), "plane", "Lazer", true, true, NOW));
    }

    private void move(Goal goal, UUID userId, ContributionType type, String amount, Money balance) {
        Contribution contribution = goal.registerContribution(UUID.randomUUID(), userId, type,
                Money.of(amount, "BRL"), balance, NOW);
        contributions.save(contribution);
    }

    private void flushAndClear() {
        entityManager.flush();
        entityManager.clear();
    }

    private static Money brl(String amount) {
        return Money.of(amount, "BRL");
    }

    // ---------- Metas ----------

    @Test
    @DisplayName("Grava e lê a meta com todos os campos da L-08")
    void savesAndFindsGoal() {
        UUID groupId = newGroup(newUser("Ana"));
        Goal saved = newGoal(groupId);
        flushAndClear();

        Goal found = goals.findById(saved.getId()).orElseThrow();
        assertThat(found.getName()).isEqualTo("Viagem");
        assertThat(found.getTarget()).isEqualTo(brl("1000.00"));
        assertThat(found.getDeadline()).isEqualTo(LocalDate.of(2027, 6, 30));
        assertThat(found.getIcon()).isEqualTo("plane");
        assertThat(found.getCategory()).isEqualTo("Lazer");
        assertThat(found.isMonthlyReminder()).isTrue();
        assertThat(found.isMilestonesEnabled()).isTrue();
        assertThat(found.isArchived()).isFalse();
        assertThat(found.getCreatedAt()).isEqualTo(NOW);
        assertThat(goals.findByGroupId(groupId)).extracting(Goal::getId).containsExactly(saved.getId());
    }

    @Test
    @DisplayName("Grava meta sem prazo (L-08)")
    void savesGoalWithoutDeadline() {
        UUID groupId = newGroup(newUser("Ana"));
        Goal saved = goals.save(Goal.create(UUID.randomUUID(), groupId, "Reserva", brl("500.00"), null,
                null, null, false, false, NOW));
        flushAndClear();

        assertThat(goals.findById(saved.getId()).orElseThrow().hasDeadline()).isFalse();
    }

    // ---------- Somas (RF-14) ----------

    @Test
    @DisplayName("Acumulado da meta = entradas − retiradas, calculado no banco")
    void balanceIsDepositsMinusWithdrawals() {
        UUID ana = newUser("Ana");
        UUID groupId = newGroup(ana);
        Goal goal = newGoal(groupId);
        move(goal, ana, ContributionType.ENTRADA, "300.00", brl("0.00"));
        move(goal, ana, ContributionType.ENTRADA, "200.50", brl("300.00"));
        move(goal, ana, ContributionType.RETIRADA, "100.25", brl("500.50"));
        flushAndClear();

        assertThat(contributions.balanceOf(goal)).isEqualTo(brl("400.25"));
        assertThat(contributions.findByGoal(goal)).hasSize(3);
    }

    @Test
    @DisplayName("Meta sem movimentos tem acumulado zero")
    void emptyBalanceIsZero() {
        Goal goal = newGoal(newGroup(newUser("Ana")));

        assertThat(contributions.balanceOf(goal)).isEqualTo(brl("0.00"));
        assertThat(contributions.totalsByMember(goal)).isEmpty();
    }

    @Test
    @DisplayName("Soma por membro desconta as retiradas de cada um")
    void totalsByMember() {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        Goal goal = newGoal(newGroup(ana));
        move(goal, ana, ContributionType.ENTRADA, "500.00", brl("0.00"));
        move(goal, bruno, ContributionType.ENTRADA, "300.00", brl("500.00"));
        move(goal, ana, ContributionType.RETIRADA, "100.00", brl("800.00"));
        flushAndClear();

        assertThat(contributions.totalsByMember(goal)).containsExactly(
                new MemberTotal(ana, brl("400.00")),
                new MemberTotal(bruno, brl("300.00")));
    }

    @Test
    @DisplayName("Conta excluída: os movimentos continuam somando, sem o autor")
    void deletedUserKeepsContributions() {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        Goal goal = newGoal(newGroup(ana));
        move(goal, ana, ContributionType.ENTRADA, "500.00", brl("0.00"));
        move(goal, bruno, ContributionType.ENTRADA, "300.00", brl("500.00"));
        flushAndClear();

        jdbc.update("DELETE FROM users WHERE id = ?", bruno);

        assertThat(contributions.balanceOf(goal)).isEqualTo(brl("800.00"));
        assertThat(contributions.totalsByMember(goal)).containsExactly(
                new MemberTotal(ana, brl("500.00")),
                new MemberTotal(null, brl("300.00")));
    }

    // Uma recusa por teste: no PostgreSQL, depois de um erro, a transação fica abortada
    // e os comandos seguintes falham com "current transaction is aborted".

    @Test
    @DisplayName("Banco recusa movimento sem meta (FK)")
    void databaseRejectsContributionWithoutGoal() {
        UUID ana = newUser("Ana");
        flushAndClear();

        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO contributions (id, goal_id, user_id, type, amount) VALUES (?, ?, ?, 'ENTRADA', 10)",
                UUID.randomUUID(), UUID.randomUUID(), ana))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Banco aceita só ENTRADA e RETIRADA (L-07)")
    void databaseRejectsUnknownContributionType() {
        UUID ana = newUser("Ana");
        Goal goal = newGoal(newGroup(ana));
        flushAndClear();
    }
}