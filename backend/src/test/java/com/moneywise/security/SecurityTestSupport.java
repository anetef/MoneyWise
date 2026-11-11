package com.moneywise.security;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Currency;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.moneywise.TestcontainersConfiguration;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;
import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.domain.Goal;
import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.domain.Group;
import com.moneywise.shared.money.Money;
import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.Transaction;
import com.moneywise.transactions.domain.TransactionType;


@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
@Tag("security")
abstract class SecurityTestSupport {

    protected static final String API = "/api/v1";

    @Autowired private WebApplicationContext context;
    @Autowired protected UserRepository users;
    @Autowired protected GroupRepository groups;
    @Autowired protected GoalRepository goals;
    @Autowired protected TransactionRepository transactions;

    protected MockMvc mockMvc;

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    protected JwtRequestPostProcessor asUser(UUID userId) {
        return jwt().jwt(token -> token.subject(userId.toString()));
    }

    protected UUID newUser(String name) {
        User user = User.register(name, Email.of("qa01-" + UUID.randomUUID() + "@example.com"),
                "hash-da-senha", Currency.getInstance("BRL"));
        user.markEmailVerified(Instant.now());
        return users.save(user).getId();
    }

    protected UUID newGroup(UUID adminId, UUID... memberIds) {
        UUID groupId = UUID.randomUUID();
        Instant now = Instant.now();
        Group group = Group.create(groupId, "Família", adminId, now);
        for (UUID memberId : memberIds) {
            now = now.plusSeconds(1);
            group = group.addMember(memberId, now);
        }
        groups.save(group);
        return groupId;
    }

    protected UUID newGoal(UUID groupId) {
        UUID goalId = UUID.randomUUID();
        goals.save(Goal.create(goalId, groupId, "Viagem", Money.of("1000.00", "BRL"),
                LocalDate.now().plusMonths(6), null, null, false, false, Instant.now()));
        return goalId;
    }

    protected Transaction newTransaction(UUID userId, String amount, TransactionType type) {
        return transactions.save(Transaction.create(UUID.randomUUID(), userId, Money.of(amount, "BRL"),
                LocalDate.now(), Category.of("Salário"), type));
    }
}