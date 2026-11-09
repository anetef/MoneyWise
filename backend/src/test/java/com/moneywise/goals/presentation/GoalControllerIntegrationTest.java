package com.moneywise.goals.presentation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Currency;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.moneywise.TestcontainersConfiguration;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;
import com.moneywise.goals.application.port.ContributionRepository;
import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.domain.ContributionType;
import com.moneywise.goals.domain.Goal;
import com.moneywise.goals.domain.Thermometer;
import com.moneywise.goals.domain.ThermometerCalculator;
import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.domain.Group;
import com.moneywise.shared.money.Money;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class GoalControllerIntegrationTest {

    @Autowired private WebApplicationContext context;
    @Autowired private UserRepository users;
    @Autowired private GroupRepository groups;
    @Autowired private GoalRepository goals;
    @Autowired private ContributionRepository contributions;
    @Autowired @Qualifier("transactionBusinessClock") private Clock businessClock;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    // ---------- Auxiliares ----------

    private UUID newUser(String name, String currency) {
        User user = User.register(name, Email.of("goal03-" + UUID.randomUUID() + "@example.com"),
                "hash-da-senha", Currency.getInstance(currency));
        return users.save(user).getId();
    }

    private UUID newGroup(UUID adminId, UUID... memberIds) {
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

    private LocalDate inSixMonths() {
        return LocalDate.now(businessClock).plusMonths(6);
    }

    private ResultActions createGoal(UUID userId, UUID groupId, UUID goalId, String name, String targetAmount,
            LocalDate deadline) throws Exception {
        String deadlineJson = deadline == null ? "null" : "\"" + deadline + "\"";
        String body = """
                {"id":"%s","name":"%s","targetAmount":%s,"deadline":%s,
                 "icon":"plane","category":"Lazer","monthlyReminder":true,"milestonesEnabled":true}
                """.formatted(goalId, name, targetAmount, deadlineJson);
        return mockMvc.perform(post("/api/v1/groups/" + groupId + "/goals").with(asUser(userId))
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private ResultActions thermometer(UUID userId, UUID goalId) throws Exception {
        return mockMvc.perform(get("/api/v1/goals/" + goalId + "/thermometer").with(asUser(userId)));
    }

    private void move(Goal goal, UUID userId, ContributionType type, String amount) {
        Money balance = contributions.balanceOf(goal);
        contributions.save(goal.registerContribution(UUID.randomUUID(), userId, type,
                Money.of(amount, goal.getCurrency().getCurrencyCode()), balance, Instant.now()));
    }

    private JwtRequestPostProcessor asUser(UUID userId) {
        return jwt().jwt(token -> token.subject(userId.toString()));
    }

    // ---------- Criar meta ----------

    @Test
    @DisplayName("Admin cria meta: 201, com a moeda do perfil de quem cria")
    void adminCreatesGoal() throws Exception {
        UUID admin = newUser("Ana", "USD");
        UUID groupId = newGroup(admin);
        UUID goalId = UUID.randomUUID();

        createGoal(admin, groupId, goalId, "Viagem", "1500.00", inSixMonths())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(goalId.toString()))
                .andExpect(jsonPath("$.groupId").value(groupId.toString()))
                .andExpect(jsonPath("$.name").value("Viagem"))
                .andExpect(jsonPath("$.targetAmount").value(1500.00))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.archived").value(false));

        assertThat(goals.findById(goalId)).isPresent();
    }

    @Test
    @DisplayName("Caixinha individual: grupo com um membro só cria a própria meta (L-06)")
    void individualGoal() throws Exception {
        UUID owner = newUser("Ana", "BRL");
        UUID groupId = newGroup(owner);

        createGoal(owner, groupId, UUID.randomUUID(), "Reserva", "500.00", null)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.deadline").doesNotExist());
    }

    @Test
    @DisplayName("Membro que não é Admin recebe 403 (L-17)")
    void memberCannotCreateGoal() throws Exception {
        UUID admin = newUser("Ana", "BRL");
        UUID member = newUser("Bruno", "BRL");
        UUID groupId = newGroup(admin, member);
        UUID goalId = UUID.randomUUID();

        createGoal(member, groupId, goalId, "Viagem", "1000.00", inSixMonths())
                .andExpect(status().isForbidden());

        assertThat(goals.findById(goalId)).isEmpty();
    }

    @Test
    @DisplayName("Quem não é membro recebe 404, sem revelar o grupo")
    void nonMemberCannotCreateGoal() throws Exception {
        UUID groupId = newGroup(newUser("Ana", "BRL"));
        UUID outsider = newUser("Carla", "BRL");

        createGoal(outsider, groupId, UUID.randomUUID(), "Viagem", "1000.00", inSixMonths())
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Valor da meta zero ou negativo responde 400")
    void rejectsNonPositiveTarget() throws Exception {
        UUID admin = newUser("Ana", "BRL");
        UUID groupId = newGroup(admin);

        createGoal(admin, groupId, UUID.randomUUID(), "Viagem", "0.00", inSixMonths())
                .andExpect(status().isBadRequest());
        createGoal(admin, groupId, UUID.randomUUID(), "Viagem", "-10.00", inSixMonths())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Prazo no passado responde 422")
    void rejectsPastDeadline() throws Exception {
        UUID admin = newUser("Ana", "BRL");
        UUID groupId = newGroup(admin);

        createGoal(admin, groupId, UUID.randomUUID(), "Viagem", "1000.00",
                LocalDate.now(businessClock).minusDays(1))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("INVALID_GOAL_DEADLINE"));
    }

    @Test
    @DisplayName("Reenvio com o mesmo id não duplica nem altera a meta (seção 6.4)")
    void retryDoesNotDuplicate() throws Exception {
        UUID admin = newUser("Ana", "BRL");
        UUID groupId = newGroup(admin);
        UUID goalId = UUID.randomUUID();
        createGoal(admin, groupId, goalId, "Viagem", "1000.00", inSixMonths()).andExpect(status().isCreated());

        createGoal(admin, groupId, goalId, "Outro nome", "9999.00", inSixMonths())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Viagem"))
                .andExpect(jsonPath("$.targetAmount").value(1000.00));

        assertThat(goals.findByGroupId(groupId)).hasSize(1);
    }

    @Test
    @DisplayName("Id de meta de outro grupo responde 404 e não altera a meta (N4)")
    void idFromAnotherGroupIsNotFound() throws Exception {
        UUID ana = newUser("Ana", "BRL");
        UUID bruno = newUser("Bruno", "BRL");
        UUID anaGroup = newGroup(ana);
        UUID brunoGroup = newGroup(bruno);
        UUID goalId = UUID.randomUUID();
        createGoal(ana, anaGroup, goalId, "Viagem", "1000.00", inSixMonths()).andExpect(status().isCreated());

        createGoal(bruno, brunoGroup, goalId, "Carro", "5000.00", inSixMonths())
                .andExpect(status().isNotFound());

        Goal original = goals.findById(goalId).orElseThrow();
        assertThat(original.getGroupId()).isEqualTo(anaGroup);
        assertThat(original.getName()).isEqualTo("Viagem");
    }

    // ---------- Termômetro ----------

    @Test
    @DisplayName("Termômetro bate com o ThermometerCalculator e mostra a soma por membro")
    void thermometerMatchesCalculator() throws Exception {
        UUID admin = newUser("Ana", "BRL");
        UUID member = newUser("Bruno", "BRL");
        UUID groupId = newGroup(admin, member);
        UUID goalId = UUID.randomUUID();
        createGoal(admin, groupId, goalId, "Viagem", "1000.00", inSixMonths()).andExpect(status().isCreated());

        Goal goal = goals.findById(goalId).orElseThrow();
        move(goal, admin, ContributionType.ENTRADA, "500.00");
        move(goal, member, ContributionType.ENTRADA, "300.00");
        move(goal, admin, ContributionType.RETIRADA, "100.00");

        Thermometer expected = ThermometerCalculator.calculate(goal, contributions.balanceOf(goal), businessClock);

        thermometer(member, goalId)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.goalId").value(goalId.toString()))
                .andExpect(jsonPath("$.status").value(expected.status().name()))
                .andExpect(jsonPath("$.progressPercent").value(expected.progressPercent().doubleValue()))
                .andExpect(jsonPath("$.accumulated").value(700.00))
                .andExpect(jsonPath("$.targetAmount").value(1000.00))
                .andExpect(jsonPath("$.remaining").value(300.00))
                .andExpect(jsonPath("$.currency").value("BRL"))
                .andExpect(jsonPath("$.daysLeft").value(expected.daysLeft()))
                .andExpect(jsonPath("$.contributors[0].name").value("Ana"))
                .andExpect(jsonPath("$.contributors[0].total").value(400.00))
                .andExpect(jsonPath("$.contributors[1].name").value("Bruno"))
                .andExpect(jsonPath("$.contributors[1].total").value(300.00));
    }

    @Test
    @DisplayName("Termômetro de meta nova: sem aportes, 0%")
    void thermometerOfNewGoal() throws Exception {
        UUID admin = newUser("Ana", "BRL");
        UUID groupId = newGroup(admin);
        UUID goalId = UUID.randomUUID();
        createGoal(admin, groupId, goalId, "Viagem", "1000.00", inSixMonths()).andExpect(status().isCreated());

        thermometer(admin, goalId)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SEM_APORTES"))
                .andExpect(jsonPath("$.progressPercent").value(0.0))
                .andExpect(jsonPath("$.contributors").isEmpty());
    }

    @Test
    @DisplayName("Quem não é membro não vê o Termômetro (404); meta inexistente também é 404")
    void nonMemberCannotSeeThermometer() throws Exception {
        UUID admin = newUser("Ana", "BRL");
        UUID groupId = newGroup(admin);
        UUID goalId = UUID.randomUUID();
        createGoal(admin, groupId, goalId, "Viagem", "1000.00", inSixMonths()).andExpect(status().isCreated());
        UUID outsider = newUser("Carla", "BRL");

        thermometer(outsider, goalId).andExpect(status().isNotFound());
        thermometer(admin, UUID.randomUUID()).andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Sem token responde 401")
    void requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/goals/" + UUID.randomUUID() + "/thermometer"))
                .andExpect(status().isUnauthorized());
    }
}