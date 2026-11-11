package com.moneywise.goals.infrastructure.websocket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Type;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Currency;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.converter.JacksonJsonMessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.client.RestClient;
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

import org.springframework.http.MediaType;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
class GoalWebSocketIntegrationTest {

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
        // groups → goals → contributions saem em cascata; depois os usuários.
        createdGroups.forEach(id -> jdbc.update("DELETE FROM groups WHERE id = ?", id));
        createdUsers.forEach(id -> jdbc.update("DELETE FROM users WHERE id = ?", id));
    }

      @SuppressWarnings("unchecked")
    private Map<String, Object> contribute(UUID userId, UUID goalId, String type, String amount) {
        String body = """
                {"id":"%s","type":"%s","amount":%s}
                """.formatted(UUID.randomUUID(), type, amount);
        return RestClient.create("http://localhost:" + port)
                .post()
                .uri("/api/v1/goals/{id}/contributions", goalId)
                .header("Authorization", "Bearer " + tokenService.issueAccessToken(userId))
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);
    }

    
    private void waitForSubscriptions() throws InterruptedException {
        Thread.sleep(500);
    }
    
    // ---------- Auxiliares ----------

    private UUID newUser(String name) {
        User user = User.register(name, Email.of("goal07-" + UUID.randomUUID() + "@example.com"),
                "hash-da-senha", Currency.getInstance("BRL"));
        UUID id = users.save(user).getId();
        createdUsers.add(id);
        return id;
    }

    /** Grupo com o Admin e os membros informados, e uma meta de R$ 1.000. Devolve o id da meta. */
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

    /** Inscreve em /topic/goals/{id}; cada mensagem recebida entra na fila. */
    private BlockingQueue<Map<String, Object>> subscribe(StompSession session, UUID goalId) {
        BlockingQueue<Map<String, Object>> received = new LinkedBlockingQueue<>();
        session.subscribe("/topic/goals/" + goalId, new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return Map.class;
            }

            @Override
            @SuppressWarnings("unchecked")
            public void handleFrame(StompHeaders headers, Object payload) {
                received.add((Map<String, Object>) payload);
            }
        });
        return received;
    }

    /** O servidor recusa um frame respondendo ERROR e fechando a conexão. */
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

    // ---------- Conexão ----------

    @Test
    @DisplayName("Conexão sem token é recusada")
    void rejectsConnectionWithoutToken() {
        assertThatThrownBy(() -> connect(null).get(TIMEOUT_SECONDS, TimeUnit.SECONDS))
                .isInstanceOf(ExecutionException.class);
    }

    @Test
    @DisplayName("Conexão com token inválido é recusada")
    void rejectsConnectionWithInvalidToken() {
        assertThatThrownBy(() -> connect("Bearer token-invalido").get(TIMEOUT_SECONDS, TimeUnit.SECONDS))
                .isInstanceOf(ExecutionException.class);
    }

    @Test
    @DisplayName("Conexão com token válido é aceita")
    void acceptsConnectionWithValidToken() throws Exception {
        StompSession session = connectAs(newUser("Ana"));

        assertThat(session.isConnected()).isTrue();
    }

    // ---------- Inscrição ----------

    @Test
    @DisplayName("Membro do grupo se inscreve em /topic/goals/{id} e a conexão continua aberta")
    void memberCanSubscribe() throws Exception {
        UUID ana = newUser("Ana");
        UUID goalId = goalOf(ana);
        StompSession session = connectAs(ana);

        subscribe(session, goalId);

        assertThat(closedWithin(session, 1)).isFalse();
    }

    @Test
    @DisplayName("Inscrição de não membro em /topic/goals/{id} é recusada")
    void rejectsNonMemberSubscription() throws Exception {
        UUID goalId = goalOf(newUser("Ana"));
        StompSession stranger = connectAs(newUser("Estranho"));

        subscribe(stranger, goalId);

        assertThat(closedWithin(stranger, TIMEOUT_SECONDS)).isTrue();
    }

    @Test
    @DisplayName("Inscrição em meta inexistente ou em outro tópico é recusada")
    void rejectsUnknownGoalAndOtherTopics() throws Exception {
        StompSession unknownGoal = connectAs(newUser("Ana"));
        subscribe(unknownGoal, UUID.randomUUID());
        assertThat(closedWithin(unknownGoal, TIMEOUT_SECONDS)).isTrue();

        StompSession otherTopic = connectAs(newUser("Bruno"));
        otherTopic.subscribe("/topic/outra-coisa", new StompSessionHandlerAdapter() { });
        assertThat(closedWithin(otherTopic, TIMEOUT_SECONDS)).isTrue();
    }

    @Test
    @DisplayName("O app não pode publicar nos tópicos: SEND é recusado")
    void rejectsSendFromClient() throws Exception {
        UUID ana = newUser("Ana");
        UUID goalId = goalOf(ana);
        StompSession session = connectAs(ana);

        session.send("/topic/goals/" + goalId, Map.of("status", "ATINGIDA"));

        assertThat(closedWithin(session, TIMEOUT_SECONDS)).isTrue();
    }

  

        // ---------- Publicação após aporte (GOAL-08) ----------

    @Test
    @DisplayName("Dois membros inscritos recebem o Termômetro após um aporte, em menos de 2 s, igual à resposta HTTP")
    void twoSubscribersReceiveThermometerAfterContribution() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID goalId = goalOf(ana, bruno);
        BlockingQueue<Map<String, Object>> anaReceived = subscribe(connectAs(ana), goalId);
        BlockingQueue<Map<String, Object>> brunoReceived = subscribe(connectAs(bruno), goalId);
        waitForSubscriptions();

        Map<String, Object> httpResponse = contribute(bruno, goalId, "ENTRADA", "100.00");

        // poll(2 s): se a mensagem não chegar em 2 segundos, devolve null e o teste falha (RNF-01).
        Map<String, Object> toAna = anaReceived.poll(2, TimeUnit.SECONDS);
        Map<String, Object> toBruno = brunoReceived.poll(2, TimeUnit.SECONDS);

        assertThat(toAna).isNotNull();
        assertThat(toBruno).isNotNull();
        assertThat(toAna.get("goalId")).isEqualTo(goalId.toString());
        assertThat(((Number) toAna.get("accumulated")).doubleValue()).isEqualTo(100.00);
        // Mesmo formato e mesmos valores de GET /goals/{id}/thermometer (schema do OpenAPI).
        assertThat(toAna).isEqualTo(httpResponse);
        assertThat(toBruno).isEqualTo(httpResponse);
    }

    @Test
    @DisplayName("Aporte com erro não publica nada")
    void failedContributionPublishesNothing() throws Exception {
        UUID ana = newUser("Ana");
        UUID goalId = goalOf(ana);
        BlockingQueue<Map<String, Object>> received = subscribe(connectAs(ana), goalId);
        waitForSubscriptions();

        // Retirada maior que o acumulado (zero) → 422.
        assertThatThrownBy(() -> contribute(ana, goalId, "RETIRADA", "50.00"))
                .isInstanceOfSatisfying(HttpClientErrorException.class,
                        e -> assertThat(e.getStatusCode().value()).isEqualTo(422));

        assertThat(received.poll(1, TimeUnit.SECONDS)).isNull();
    }

    @Test
    @DisplayName("Quem não está inscrito na meta não recebe a atualização")
    void subscribersOfOtherGoalsReceiveNothing() throws Exception {
        UUID ana = newUser("Ana");
        UUID goalA = goalOf(ana);
        UUID goalB = goalOf(ana);
        BlockingQueue<Map<String, Object>> receivedB = subscribe(connectAs(ana), goalB);
        waitForSubscriptions();

        contribute(ana, goalA, "ENTRADA", "10.00");

        assertThat(receivedB.poll(1, TimeUnit.SECONDS)).isNull();
    }
}