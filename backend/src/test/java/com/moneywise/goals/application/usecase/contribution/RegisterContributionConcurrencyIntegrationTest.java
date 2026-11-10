package com.moneywise.goals.application.usecase.contribution;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Currency;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.IllegalTransactionStateException;

import com.moneywise.TestcontainersConfiguration;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;
import com.moneywise.goals.application.port.ContributionRepository;
import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.domain.ContributionType;
import com.moneywise.goals.domain.Goal;
import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.domain.Group;
import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.money.Money;

/**
 * Prova a trava da meta com transações reais (sem @Transactional no teste): duas retiradas simultâneas
 * não podem deixar o acumulado negativo.
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
class RegisterContributionConcurrencyIntegrationTest {

    @Autowired private RegisterContribution registerContribution;
    @Autowired private GoalRepository goals;
    @Autowired private ContributionRepository contributions;
    @Autowired private GroupRepository groups;
    @Autowired private UserRepository users;
    @Autowired private JdbcTemplate jdbc;

    private final List<UUID> createdUsers = new ArrayList<>();
    private final List<UUID> createdGroups = new ArrayList<>();

    @AfterEach
    void cleanUp() {
        // groups → goals → contributions saem em cascata; depois os usuários.
        createdGroups.forEach(id -> jdbc.update("DELETE FROM groups WHERE id = ?", id));
        createdUsers.forEach(id -> jdbc.update("DELETE FROM users WHERE id = ?", id));
    }

    private UUID newUser(String name) {
        User user = User.register(name, Email.of("goal04-" + UUID.randomUUID() + "@example.com"),
                "hash-da-senha", Currency.getInstance("BRL"));
        UUID id = users.save(user).getId();
        createdUsers.add(id);
        return id;
    }

    private Goal goalWithBalance(UUID admin, UUID member, String balance) {
        UUID groupId = UUID.randomUUID();
        Instant now = Instant.now();
        groups.save(Group.create(groupId, "Família", admin, now).addMember(member, now.plusSeconds(1)));
        createdGroups.add(groupId);

        Goal goal = goals.save(Goal.create(UUID.randomUUID(), groupId, "Viagem", Money.of("1000.00", "BRL"),
                LocalDate.now().plusMonths(6), null, null, false, false, now));
        registerContribution.execute(new RegisterContributionCommand(UUID.randomUUID(), goal.getId(), admin,
                ContributionType.ENTRADA, new BigDecimal(balance)));
        return goal;
    }

    @Test
    @DisplayName("Duas retiradas de 80 ao mesmo tempo num saldo de 100: só uma passa, saldo final 20")
    void concurrentWithdrawalsNeverMakeBalanceNegative() throws Exception {
        UUID admin = newUser("Ana");
        UUID member = newUser("Bruno");
        Goal goal = goalWithBalance(admin, member, "100.00");

        CountDownLatch start = new CountDownLatch(1);
        Callable<Boolean> withdraw80 = () -> {
            start.await();
            try {
                registerContribution.execute(new RegisterContributionCommand(UUID.randomUUID(), goal.getId(),
                        member, ContributionType.RETIRADA, new BigDecimal("80.00")));
                return true;
            } catch (BusinessRuleException rejected) {
                return false;
            }
        };

        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            Future<Boolean> first = pool.submit(withdraw80);
            Future<Boolean> second = pool.submit(withdraw80);
            start.countDown();

            List<Boolean> results = List.of(first.get(), second.get());
            assertThat(results).containsExactlyInAnyOrder(true, false);
        } finally {
            pool.shutdown();
        }

        assertThat(contributions.balanceOf(goal)).isEqualTo(Money.of("20.00", "BRL"));
    }

    @Test
    @DisplayName("A busca com trava exige uma transação aberta")
    void lockRequiresTransaction() {
        assertThatThrownBy(() -> goals.findByIdForUpdate(UUID.randomUUID()))
                .isInstanceOf(IllegalTransactionStateException.class);
    }
}