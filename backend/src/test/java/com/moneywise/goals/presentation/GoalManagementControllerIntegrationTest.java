package com.moneywise.goals.presentation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import org.springframework.jdbc.core.JdbcTemplate;
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
import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.domain.Group;
import com.moneywise.shared.money.Money;

import jakarta.persistence.EntityManager;

/** GOAL-06: listar, detalhar, editar, histórico, arquivar e excluir metas. */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class GoalManagementControllerIntegrationTest {

    @Autowired private WebApplicationContext context;
    @Autowired private UserRepository users;
    @Autowired private GroupRepository groups;
    @Autowired private GoalRepository goals;
    @Autowired private ContributionRepository contributions;
    @Autowired private EntityManager entityManager;
    @Autowired private JdbcTemplate jdbc;
    @Autowired @Qualifier("transactionBusinessClock") private Clock businessClock;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    // ---------- Auxiliares ----------

    private UUID newUser(String name) {
        User user = User.register(name, Email.of("goal06-" + UUID.randomUUID() + "@example.com"),
                "hash-da-senha", Currency.getInstance("BRL"));
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

    private JwtRequestPostProcessor asUser(UUID userId) {
        return jwt().jwt(token -> token.subject(userId.toString()));
    }

    /** Cria uma meta de R$ 1.000 pela API, com o Admin do grupo. Devolve o id da meta. */
    private UUID createGoal(UUID admin, UUID groupId, String name) throws Exception {
        UUID goalId = UUID.randomUUID();
        String body = """
                {"id":"%s","name":"%s","targetAmount":1000.00,"deadline":"%s",
                 "icon":"plane","category":"Lazer","monthlyReminder":true,"milestonesEnabled":true}
                """.formatted(goalId, name, inSixMonths());
        mockMvc.perform(post("/api/v1/groups/" + groupId + "/goals").with(asUser(admin))
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
        return goalId;
    }

    private void move(UUID goalId, UUID userId, ContributionType type, String amount, Instant at) {
        Goal goal = goals.findById(goalId).orElseThrow();
        Money balance = contributions.balanceOf(goal);
        contributions.save(goal.registerContribution(UUID.randomUUID(), userId, type, Money.of(amount, "BRL"),
                balance, at));
    }

    private ResultActions update(UUID userId, UUID goalId, String name, String targetAmount, LocalDate deadline)
            throws Exception {
        String deadlineJson = deadline == null ? "null" : "\"" + deadline + "\"";
        String body = """
                {"name":"%s","targetAmount":%s,"deadline":%s,
                 "icon":"house","category":"Moradia","monthlyReminder":false,"milestonesEnabled":false}
                """.formatted(name, targetAmount, deadlineJson);
        return mockMvc.perform(put("/api/v1/goals/" + goalId).with(asUser(userId))
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private ResultActions contribute(UUID userId, UUID goalId, String type, String amount) throws Exception {
        String body = """
                {"id":"%s","type":"%s","amount":%s}
                """.formatted(UUID.randomUUID(), type, amount);
        return mockMvc.perform(post("/api/v1/goals/" + goalId + "/contributions").with(asUser(userId))
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    /**
     * Lista as metas. O teste roda numa transação só: o flush envia ao banco o que ainda está pendente
     * (grupos, metas, arquivamento), porque a listagem usa uma consulta SQL nativa com join em group_members.
     */
    private ResultActions listGoals(UUID userId, String... params) throws Exception {
        entityManager.flush();
        var request = get("/api/v1/goals").with(asUser(userId));
        for (int i = 0; i < params.length; i += 2) {
            request = request.param(params[i], params[i + 1]);
        }
        return mockMvc.perform(request);
    }

    // ---------- Listar ----------

    @Test
    @DisplayName("Lista as metas de todos os grupos do usuário, com o progresso, e não as de outros grupos")
    void listsGoalsOfAllUserGroups() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID carla = newUser("Carla");
        UUID anaGroup = newGroup(ana);
        UUID brunoGroup = newGroup(bruno, ana);
        UUID carlaGroup = newGroup(carla);
        UUID individual = createGoal(ana, anaGroup, "Reserva");
        UUID shared = createGoal(bruno, brunoGroup, "Viagem");
        createGoal(carla, carlaGroup, "Carro");
        move(shared, ana, ContributionType.ENTRADA, "250.00", Instant.now());

        listGoals(ana)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[*].id", containsInAnyOrder(individual.toString(), shared.toString())))
                .andExpect(jsonPath("$[?(@.id == '%s')].accumulated".formatted(shared)).value(250.00))
                .andExpect(jsonPath("$[?(@.id == '%s')].progressPercent".formatted(shared)).value(25.00))
                .andExpect(jsonPath("$[?(@.id == '%s')].status".formatted(individual)).value("SEM_APORTES"));
    }

    @Test
    @DisplayName("Filtro por grupo: lista só as daquele grupo; grupo do qual não é membro → 404")
    void filtersByGroup() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID anaGroup = newGroup(ana);
        UUID brunoGroup = newGroup(bruno);
        UUID individual = createGoal(ana, anaGroup, "Reserva");
        createGoal(ana, newGroup(ana), "Outra");
        createGoal(bruno, brunoGroup, "Carro");

        listGoals(ana, "groupId", anaGroup.toString())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", contains(individual.toString())));

        listGoals(ana, "groupId", brunoGroup.toString())
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Metas arquivadas só aparecem com archived=true")
    void archivedGoalsOnlyWithFilter() throws Exception {
        UUID ana = newUser("Ana");
        UUID groupId = newGroup(ana);
        UUID active = createGoal(ana, groupId, "Ativa");
        UUID archived = createGoal(ana, groupId, "Arquivada");
        mockMvc.perform(post("/api/v1/goals/" + archived + "/archive").with(asUser(ana)))
                .andExpect(status().isOk());

        listGoals(ana)
                .andExpect(jsonPath("$[*].id", contains(active.toString())));
        listGoals(ana, "archived", "true")
                .andExpect(jsonPath("$[*].id", contains(archived.toString())))
                .andExpect(jsonPath("$[0].archived").value(true));
    }

    // ---------- Detalhar ----------

    @Test
    @DisplayName("Membro vê o detalhe da meta; não membro → 404")
    void detail() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID stranger = newUser("Estranho");
        UUID goalId = createGoal(ana, newGroup(ana, bruno), "Viagem");

        mockMvc.perform(get("/api/v1/goals/" + goalId).with(asUser(bruno)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(goalId.toString()))
                .andExpect(jsonPath("$.name").value("Viagem"))
                .andExpect(jsonPath("$.targetAmount").value(1000.00))
                .andExpect(jsonPath("$.currency").value("BRL"));
        mockMvc.perform(get("/api/v1/goals/" + goalId).with(asUser(stranger)))
                .andExpect(status().isNotFound());
    }

    // ---------- Editar ----------

    @Test
    @DisplayName("Admin edita a meta: 200 com os novos dados, a moeda não muda")
    void adminUpdatesGoal() throws Exception {
        UUID ana = newUser("Ana");
        UUID goalId = createGoal(ana, newGroup(ana), "Viagem");
        LocalDate newDeadline = inSixMonths().plusMonths(1);

        update(ana, goalId, "Casa", "2500.00", newDeadline)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Casa"))
                .andExpect(jsonPath("$.targetAmount").value(2500.00))
                .andExpect(jsonPath("$.currency").value("BRL"))
                .andExpect(jsonPath("$.deadline").value(newDeadline.toString()))
                .andExpect(jsonPath("$.icon").value("house"))
                .andExpect(jsonPath("$.monthlyReminder").value(false));

        Goal saved = goals.findById(goalId).orElseThrow();
        assertThat(saved.getTarget()).isEqualTo(Money.of("2500.00", "BRL"));
        assertThat(saved.getName()).isEqualTo("Casa");
    }

    @Test
    @DisplayName("RN04: membro comum não altera o valor da meta → 403, nada muda")
    void memberCannotUpdateGoal() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID goalId = createGoal(ana, newGroup(ana, bruno), "Viagem");

        update(bruno, goalId, "Viagem", "1.00", inSixMonths())
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("GROUP_ADMIN_REQUIRED"));

        assertThat(goals.findById(goalId).orElseThrow().getTarget()).isEqualTo(Money.of("1000.00", "BRL"));
    }

    @Test
    @DisplayName("Editar: não membro → 404; valor zero → 400")
    void updateRejectsNonMemberAndInvalidBody() throws Exception {
        UUID ana = newUser("Ana");
        UUID stranger = newUser("Estranho");
        UUID goalId = createGoal(ana, newGroup(ana), "Viagem");

        update(stranger, goalId, "Viagem", "100.00", null).andExpect(status().isNotFound());
        update(ana, goalId, "Viagem", "0", null).andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Editar: prazo novo no passado → 422; prazo vencido que não mudou é aceito")
    void deadlineValidatedOnlyWhenChanged() throws Exception {
        UUID ana = newUser("Ana");
        UUID groupId = newGroup(ana);
        LocalDate yesterday = LocalDate.now(businessClock).minusDays(1);
        UUID goalId = createGoal(ana, groupId, "Viagem");

        update(ana, goalId, "Viagem", "1000.00", yesterday)
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("INVALID_GOAL_DEADLINE"));

        // Meta cujo prazo já venceu: grava direto pelo repositório, porque a API não cria prazo no passado.
        UUID overdueId = UUID.randomUUID();
        goals.save(Goal.create(overdueId, groupId, "Vencida", Money.of("500.00", "BRL"), yesterday, null, null,
                false, false, Instant.now()));

        update(ana, overdueId, "Vencida renomeada", "500.00", yesterday)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Vencida renomeada"));
    }

    @Test
    @DisplayName("Editar meta arquivada → 422 GOAL_ARCHIVED")
    void cannotUpdateArchivedGoal() throws Exception {
        UUID ana = newUser("Ana");
        UUID goalId = createGoal(ana, newGroup(ana), "Viagem");
        mockMvc.perform(post("/api/v1/goals/" + goalId + "/archive").with(asUser(ana)))
                .andExpect(status().isOk());

        update(ana, goalId, "Casa", "1000.00", null)
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("GOAL_ARCHIVED"));
    }

    // ---------- Histórico ----------

    @Test
    @DisplayName("Histórico: do mais novo para o mais antigo, com o nome de quem fez e paginação")
    void contributionHistory() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID goalId = createGoal(ana, newGroup(ana, bruno), "Viagem");
        Instant base = Instant.now().minusSeconds(60);
        move(goalId, ana, ContributionType.ENTRADA, "100.00", base);
        move(goalId, bruno, ContributionType.ENTRADA, "50.00", base.plusSeconds(10));
        move(goalId, ana, ContributionType.RETIRADA, "30.00", base.plusSeconds(20));

        mockMvc.perform(get("/api/v1/goals/" + goalId + "/contributions").param("size", "2").with(asUser(bruno)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].type").value("RETIRADA"))
                .andExpect(jsonPath("$.content[0].amount").value(30.00))
                .andExpect(jsonPath("$.content[0].userName").value("Ana"))
                .andExpect(jsonPath("$.content[0].currency").value("BRL"))
                .andExpect(jsonPath("$.content[1].userName").value("Bruno"))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.hasNext").value(true));

        mockMvc.perform(get("/api/v1/goals/" + goalId + "/contributions").param("page", "1").param("size", "2")
                        .with(asUser(bruno)))
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].type").value("ENTRADA"))
                .andExpect(jsonPath("$.content[0].amount").value(100.00))
                .andExpect(jsonPath("$.hasNext").value(false));
    }

    @Test
    @DisplayName("Histórico: paginação inválida → 400; não membro → 404")
    void historyRejectsInvalidPageAndNonMember() throws Exception {
        UUID ana = newUser("Ana");
        UUID stranger = newUser("Estranho");
        UUID goalId = createGoal(ana, newGroup(ana), "Viagem");

        mockMvc.perform(get("/api/v1/goals/" + goalId + "/contributions").param("size", "101").with(asUser(ana)))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/goals/" + goalId + "/contributions").with(asUser(stranger)))
                .andExpect(status().isNotFound());
    }

    // ---------- Arquivar ----------

    @Test
    @DisplayName("Admin arquiva: a meta não aceita movimentos; ao desarquivar, volta a aceitar")
    void archiveAndUnarchive() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID goalId = createGoal(ana, newGroup(ana, bruno), "Viagem");

        mockMvc.perform(post("/api/v1/goals/" + goalId + "/archive").with(asUser(ana)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.archived").value(true));
        contribute(bruno, goalId, "ENTRADA", "10.00")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("GOAL_ARCHIVED"));

        mockMvc.perform(post("/api/v1/goals/" + goalId + "/unarchive").with(asUser(ana)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.archived").value(false));
        contribute(bruno, goalId, "ENTRADA", "10.00").andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Membro comum não arquiva → 403; não membro → 404")
    void memberCannotArchive() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID stranger = newUser("Estranho");
        UUID goalId = createGoal(ana, newGroup(ana, bruno), "Viagem");

        mockMvc.perform(post("/api/v1/goals/" + goalId + "/archive").with(asUser(bruno)))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/v1/goals/" + goalId + "/archive").with(asUser(stranger)))
                .andExpect(status().isNotFound());
        assertThat(goals.findById(goalId).orElseThrow().isArchived()).isFalse();
    }

    // ---------- Excluir ----------

    @Test
    @DisplayName("Admin exclui meta sem saldo: 204, a meta e o histórico somem")
    void adminDeletesGoalWithoutBalance() throws Exception {
        UUID ana = newUser("Ana");
        UUID goalId = createGoal(ana, newGroup(ana), "Viagem");
        Instant base = Instant.now().minusSeconds(60);
        move(goalId, ana, ContributionType.ENTRADA, "100.00", base);
        move(goalId, ana, ContributionType.RETIRADA, "100.00", base.plusSeconds(10));

        mockMvc.perform(delete("/api/v1/goals/" + goalId).with(asUser(ana)))
                .andExpect(status().isNoContent());

        entityManager.flush();
        mockMvc.perform(get("/api/v1/goals/" + goalId).with(asUser(ana)))
                .andExpect(status().isNotFound());
        Integer remaining = jdbc.queryForObject("SELECT COUNT(*) FROM contributions WHERE goal_id = ?",
                Integer.class, goalId);
        assertThat(remaining).isZero();
    }

    @Test
    @DisplayName("Excluir meta com saldo → 422 GOAL_HAS_BALANCE, a meta continua")
    void cannotDeleteGoalWithBalance() throws Exception {
        UUID ana = newUser("Ana");
        UUID goalId = createGoal(ana, newGroup(ana), "Viagem");
        move(goalId, ana, ContributionType.ENTRADA, "0.01", Instant.now());

        mockMvc.perform(delete("/api/v1/goals/" + goalId).with(asUser(ana)))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("GOAL_HAS_BALANCE"));
        assertThat(goals.findById(goalId)).isPresent();
    }

    @Test
    @DisplayName("Membro comum não exclui → 403; não membro → 404")
    void memberCannotDelete() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID stranger = newUser("Estranho");
        UUID goalId = createGoal(ana, newGroup(ana, bruno), "Viagem");

        mockMvc.perform(delete("/api/v1/goals/" + goalId).with(asUser(bruno)))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/goals/" + goalId).with(asUser(stranger)))
                .andExpect(status().isNotFound());
        assertThat(goals.findById(goalId)).isPresent();
    }
}