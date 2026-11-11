package com.moneywise.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Currency;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.converter.JacksonJsonMessageConverter;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import com.moneywise.TestcontainersConfiguration;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;
import com.moneywise.auth.infrastructure.security.jwt.JwtTokenService;
import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.domain.Goal;
import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.domain.Group;
import com.moneywise.shared.money.Money;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
@Tag("security")
@DisplayName("Segurança: só membros se inscrevem no tópico da meta (WebSocket)")
class GoalSubscriptionSecurityTest {

    private static final long TIMEOUT_SECONDS = 5;

    @LocalServerPort private int port;
    @Autowired private JwtTokenService tokenService;
    @Autowired private UserRepository users;
    @Autowired private GroupRepository groups;
    @Autowired private GoalRepository goals;
    @Autowired private JdbcTemplate jdbc;

    private WebSocketStompClient stompClient;
    private final List<StompSession> sessions = new ArrayList<>();
    private final List<UUID> createdUsers = new ArrayList<>();
    private final List<UUID> createdGroups = new ArrayList<>();

    @BeforeEach
    void setUp() {
        stompClient = new WebSocketStompClient(new StandardWebSocketClient());
        stompClient.setMessageConverter(new JacksonJsonMessageConverter());
    }

    @AfterEach
    void cleanUp() {
        sessions.stream().filter(StompSession::isConnected).forEach(StompSession::disconnect);
        stompClient.stop();
        createdGroups.forEach(id -> jdbc.update("DELETE FROM groups WHERE id = ?", id));
        createdUsers.forEach(id -> jdbc.update("DELETE FROM users WHERE id = ?", id));
    }

    // ---------- Auxiliares ----------

    private UUID newUser(String name) {
        User user = User.register(name, Email.of("qa01-ws-" + UUID.randomUUID() + "@example.com"),
                "hash-da-senha", Currency.getInstance("BRL"));
        UUID id = users.save(user).getId();
        createdUsers.add(id);
        return id;
    }

    /** Grupo com Admin e membros, e uma meta. Devolve o id da meta. */
    private UUID goalOf(UUID admin, UUID... members) {
        UUID groupId = UUID.randomUUID();
        Instant now = Instant.now();
        Group group = Group.create(groupId, "Família", admin, now);
        for (UUID member : members) {
            now = now.plusSeconds(1);
            group = group.addMember(member, now);
        }
        groups.save(group);
        createdGroups.add(groupId);

        UUID goalId = UUID.randomUUID();
        goals.save(Goal.create(goalId, groupId, "Viagem", Money.of("1000.00", "BRL"),
                LocalDate.now().plusMonths(6), null, null, false, false, now));
        return goalId;
    }

    private CompletableFuture<StompSession> connect(String authorization) {
        WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
        if (authorization != null) {
            headers.add("Authorization", authorization);
        }
        return stompClient.connectAsync("ws://localhost:" + port + "/ws", headers,
                new StompSessionHandlerAdapter() { });
    }

    private StompSession connectAs(UUID userId) throws Exception {
        StompSession session = connect("Bearer " + tokenService.issueAccessToken(userId))
                .get(TIMEOUT_SECONDS, TimeUnit.SECONDS);
        sessions.add(session);
        return session;
    }

    private void subscribeToGoal(StompSession session, UUID goalId) {
        session.subscribe("/topic/goals/" + goalId, new StompSessionHandlerAdapter() { });
    }

    private boolean closedWithin(StompSession session, long seconds) throws InterruptedException {
        long deadline = System.currentTimeMillis() + seconds * 1000;
        while (System.currentTimeMillis() < deadline) {
            if (!session.isConnected()) {
                return true;
            }
            Thread.sleep(50);
        }
        return false;
    }

    // ---------- Cenários ----------

    @Test
    @DisplayName("Controle: o membro se inscreve e a conexão continua aberta")
    void memberCanSubscribe() throws Exception {
        UUID ana = newUser("Ana");
        UUID goalId = goalOf(ana);
        StompSession session = connectAs(ana);

        subscribeToGoal(session, goalId);

        assertThat(closedWithin(session, 1)).isFalse();
    }

    @Test
    @DisplayName("Não membro tenta se inscrever em /topic/goals/{id}: recusado e a conexão é fechada")
    void nonMemberSubscriptionIsRejected() throws Exception {
        UUID goalId = goalOf(newUser("Ana"));
        StompSession stranger = connectAs(newUser("Estranho"));

        subscribeToGoal(stranger, goalId);

        assertThat(closedWithin(stranger, TIMEOUT_SECONDS)).isTrue();
    }

    @Test
    @DisplayName("Membro removido do grupo não consegue mais se inscrever")
    void removedMemberSubscriptionIsRejected() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID goalId = goalOf(ana, bruno);
        UUID groupId = goals.findById(goalId).orElseThrow().getGroupId();
        jdbc.update("DELETE FROM group_members WHERE group_id = ? AND user_id = ?", groupId, bruno);
        StompSession exMember = connectAs(bruno);

        subscribeToGoal(exMember, goalId);

        assertThat(closedWithin(exMember, TIMEOUT_SECONDS)).isTrue();
    }

    @Test
    @DisplayName("Sem token ou com token inválido, a conexão nem abre")
    void connectionWithoutValidTokenIsRejected() {
        assertThatThrownBy(() -> connect(null).get(TIMEOUT_SECONDS, TimeUnit.SECONDS))
                .isInstanceOf(ExecutionException.class);
        assertThatThrownBy(() -> connect("Bearer token-invalido").get(TIMEOUT_SECONDS, TimeUnit.SECONDS))
                .isInstanceOf(ExecutionException.class);
    }

    @Test
    @DisplayName("Ninguém publica no tópico pelo app, nem membro: SEND é recusado")
    void clientCannotPublishToGoalTopic() throws Exception {
        UUID ana = newUser("Ana");
        UUID goalId = goalOf(ana);
        StompSession session = connectAs(ana);

        session.send("/topic/goals/" + goalId, Map.of("status", "ATINGIDA"));

        assertThat(closedWithin(session, TIMEOUT_SECONDS)).isTrue();
    }
}