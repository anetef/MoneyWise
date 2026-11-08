package com.moneywise.groups.presentation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Currency;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
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

import com.jayway.jsonpath.JsonPath;
import com.moneywise.TestcontainersConfiguration;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class GroupControllerIntegrationTest {

    private static final String GROUPS_URL = "/api/v1/groups";
    private static final String INVITATIONS_URL = "/api/v1/invitations";

    @Autowired private WebApplicationContext context;
    @Autowired private UserRepository users;
    @Autowired private JdbcTemplate jdbc;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    // ---------- GRP-03: criar ----------

    @Test
    @DisplayName("Cria grupo com 201, Location e o criador como ADMIN")
    void createsGroupWithCreatorAsAdmin() throws Exception {
        UUID ana = newUser("Ana");
        UUID id = UUID.randomUUID();

        create(ana, id, "Viagem")
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/v1/groups/" + id))
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Viagem"))
                .andExpect(jsonPath("$.adminId").value(ana.toString()))
                .andExpect(jsonPath("$.members.length()").value(1))
                .andExpect(jsonPath("$.members[0].userId").value(ana.toString()))
                .andExpect(jsonPath("$.members[0].name").value("Ana"))
                .andExpect(jsonPath("$.members[0].role").value("ADMIN"));

        Integer rows = jdbc.queryForObject(
                "SELECT count(*) FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'ADMIN'",
                Integer.class, id, ana);
        assertThat(rows).isEqualTo(1);
    }

    @Test
    @DisplayName("Reenvio do mesmo id pelo mesmo usuário não duplica o grupo")
    void resendIsIdempotent() throws Exception {
        UUID ana = newUser("Ana");
        UUID id = UUID.randomUUID();
        create(ana, id, "Viagem").andExpect(status().isCreated());

        create(ana, id, "Outro nome")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Viagem"));

        assertThat(jdbc.queryForObject("SELECT count(*) FROM groups WHERE id = ?", Integer.class, id)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM group_members WHERE group_id = ?", Integer.class, id))
                .isEqualTo(1);
    }

    @Test
    @DisplayName("Id de grupo alheio responde 404 e não altera o grupo")
    void idOfAnotherUsersGroupIsNotFound() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID id = UUID.randomUUID();
        create(ana, id, "Viagem").andExpect(status().isCreated());

        create(bruno, id, "Invasão").andExpect(status().isNotFound());

        assertThat(jdbc.queryForObject("SELECT name FROM groups WHERE id = ?", String.class, id))
                .isEqualTo("Viagem");
    }

    @Test
    @DisplayName("Nome em branco responde 400")
    void blankNameIsInvalid() throws Exception {
        create(newUser("Ana"), UUID.randomUUID(), " ")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("Sem token responde 401")
    void requiresAuthentication() throws Exception {
        mockMvc.perform(get(GROUPS_URL)).andExpect(status().isUnauthorized());
    }

    // ---------- GRP-03: consultar ----------

    @Test
    @DisplayName("Lista e detalha só grupos do usuário; não membro recebe 404")
    void listsAndDetailsOnlyOwnGroups() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID anaGroup = UUID.randomUUID();
        UUID brunoGroup = UUID.randomUUID();
        create(ana, anaGroup, "Da Ana").andExpect(status().isCreated());
        create(bruno, brunoGroup, "Do Bruno").andExpect(status().isCreated());

        mockMvc.perform(get(GROUPS_URL).with(asUser(ana)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(anaGroup.toString()));
        mockMvc.perform(get(GROUPS_URL + "/" + anaGroup).with(asUser(ana)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.members[0].name").value("Ana"));
        mockMvc.perform(get(GROUPS_URL + "/" + anaGroup).with(asUser(bruno)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.name").doesNotExist());
    }

    // ---------- GRP-03: remover membro e sair ----------

    @Test
    @DisplayName("Membro comum tentando remover recebe 403; Admin remove com 204 e o removido perde acesso")
    void removesMemberOnlyAsAdmin() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID carla = newUser("Carla");
        UUID groupId = groupWith(ana, bruno, carla);

        mockMvc.perform(delete(memberUrl(groupId, carla)).with(asUser(bruno)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("GROUP_ADMIN_REQUIRED"));

        mockMvc.perform(delete(memberUrl(groupId, carla)).with(asUser(ana)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get(GROUPS_URL + "/" + groupId).with(asUser(carla)))
                .andExpect(status().isNotFound());
        mockMvc.perform(get(GROUPS_URL).with(asUser(carla)))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("Quem não participa recebe 404 ao remover; membro inexistente no grupo também é 404")
    void removeNotFoundCases() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID groupId = groupWith(ana, bruno);

        mockMvc.perform(delete(memberUrl(groupId, bruno)).with(asUser(newUser("Fora"))))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete(memberUrl(groupId, UUID.randomUUID())).with(asUser(ana)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Admin que se remove passa o papel ao membro mais antigo (L-10)")
    void adminRemovingSelfPromotesOldest() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID carla = newUser("Carla");
        UUID groupId = groupWith(ana, bruno, carla);

        mockMvc.perform(delete(memberUrl(groupId, ana)).with(asUser(ana)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get(GROUPS_URL + "/" + groupId).with(asUser(carla)))
                .andExpect(jsonPath("$.adminId").value(bruno.toString()));
    }

    @Test
    @DisplayName("Membro sai pelo endpoint de sair; Admin que sai passa o papel ao mais antigo")
    void leaveGroup() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID carla = newUser("Carla");
        UUID groupId = groupWith(ana, bruno, carla);

        mockMvc.perform(delete(GROUPS_URL + "/" + groupId + "/members/me").with(asUser(carla)))
                .andExpect(status().isNoContent());
        mockMvc.perform(delete(GROUPS_URL + "/" + groupId + "/members/me").with(asUser(ana)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get(GROUPS_URL + "/" + groupId).with(asUser(bruno)))
                .andExpect(jsonPath("$.adminId").value(bruno.toString()))
                .andExpect(jsonPath("$.members.length()").value(1));
    }

    @Test
    @DisplayName("Único membro não pode sair (422)")
    void soleMemberCannotLeave() throws Exception {
        UUID ana = newUser("Ana");
        UUID groupId = UUID.randomUUID();
        create(ana, groupId, "Individual").andExpect(status().isCreated());

        mockMvc.perform(delete(GROUPS_URL + "/" + groupId + "/members/me").with(asUser(ana)))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("GROUP_LAST_MEMBER_CANNOT_LEAVE"));
    }

    // ---------- GRP-05: convites ----------

    @Test
    @DisplayName("Admin gera convite; quem recebe vê a prévia, aceita e vira membro")
    void invitationFlow() throws Exception {
        UUID ana = newUser("Ana");
        UUID carla = newUser("Carla");
        UUID groupId = UUID.randomUUID();
        create(ana, groupId, "Viagem").andExpect(status().isCreated());

        String code = JsonPath.read(mockMvc.perform(post(GROUPS_URL + "/" + groupId + "/invitations")
                        .with(asUser(ana)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.groupId").value(groupId.toString()))
                .andExpect(jsonPath("$.expiresAt").isNotEmpty())
                .andReturn().getResponse().getContentAsString(), "$.code");

        mockMvc.perform(get(INVITATIONS_URL + "/" + code).with(asUser(carla)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.groupName").value("Viagem"))
                .andExpect(jsonPath("$.invitedByName").value("Ana"))
                .andExpect(jsonPath("$.memberCount").value(1))
                .andExpect(jsonPath("$.alreadyMember").value(false))
                .andExpect(jsonPath("$.members").doesNotExist());

        mockMvc.perform(post(INVITATIONS_URL + "/" + code + "/accept").with(asUser(carla)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.members.length()").value(2))
                .andExpect(jsonPath("$.members[1].userId").value(carla.toString()))
                .andExpect(jsonPath("$.members[1].role").value("MEMBER"));

        mockMvc.perform(post(INVITATIONS_URL + "/" + code + "/accept").with(asUser(newUser("Diego"))))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("GROUP_INVITATION_NOT_PENDING"));
    }

    @Test
    @DisplayName("Membro comum recebe 403 e quem não participa é negado (404) ao convidar")
    void onlyAdminInvites() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID groupId = groupWith(ana, bruno);

        mockMvc.perform(post(GROUPS_URL + "/" + groupId + "/invitations").with(asUser(bruno)))
                .andExpect(status().isForbidden());
        mockMvc.perform(post(GROUPS_URL + "/" + groupId + "/invitations").with(asUser(newUser("Fora"))))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Usuário já membro aceita sem duplicar e o convite continua pendente")
    void alreadyMemberDoesNotDuplicate() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID groupId = groupWith(ana, bruno);
        String code = invite(groupId, ana);

        mockMvc.perform(post(INVITATIONS_URL + "/" + code + "/accept").with(asUser(bruno)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.members.length()").value(2));

        assertThat(jdbc.queryForObject("SELECT status FROM group_invitations WHERE code = ?", String.class, code))
                .isEqualTo("PENDING");
    }

    @Test
    @DisplayName("Convite com mais de 7 dias é recusado; código inexistente responde 404")
    void expiredInvitationIsRejected() throws Exception {
        UUID ana = newUser("Ana");
        UUID carla = newUser("Carla");
        UUID groupId = UUID.randomUUID();
        create(ana, groupId, "Viagem").andExpect(status().isCreated());
        Instant createdAt = Instant.now().minus(8, ChronoUnit.DAYS);
        jdbc.update("INSERT INTO group_invitations (id, code, group_id, invited_by, created_at, expires_at) "
                        + "VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), "EXPIRADO01", groupId, ana, Timestamp.from(createdAt),
                Timestamp.from(createdAt.plus(7, ChronoUnit.DAYS)));

        mockMvc.perform(get(INVITATIONS_URL + "/EXPIRADO01").with(asUser(carla)))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("GROUP_INVITATION_EXPIRED"));
        mockMvc.perform(post(INVITATIONS_URL + "/EXPIRADO01/accept").with(asUser(carla)))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("GROUP_INVITATION_EXPIRED"));
        mockMvc.perform(get(INVITATIONS_URL + "/NAOEXISTE").with(asUser(carla)))
                .andExpect(status().isNotFound());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM group_members WHERE group_id = ?", Integer.class,
                groupId)).isEqualTo(1);
    }

    // ---------- apoio ----------

    /** Cria o grupo com o primeiro usuário como Admin e inclui os demais por convite, nessa ordem. */
    private UUID groupWith(UUID admin, UUID... others) throws Exception {
        UUID groupId = UUID.randomUUID();
        create(admin, groupId, "Grupo").andExpect(status().isCreated());
        for (UUID other : others) {
            mockMvc.perform(post(INVITATIONS_URL + "/" + invite(groupId, admin) + "/accept").with(asUser(other)))
                    .andExpect(status().isOk());
        }
        return groupId;
    }

    private String invite(UUID groupId, UUID admin) throws Exception {
        return JsonPath.read(mockMvc.perform(post(GROUPS_URL + "/" + groupId + "/invitations").with(asUser(admin)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(), "$.code");
    }

    private ResultActions create(UUID userId, UUID id, String name) throws Exception {
        String body = """
                {"id":"%s","name":"%s"}
                """.formatted(id, name);
        return mockMvc.perform(post(GROUPS_URL).with(asUser(userId))
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private String memberUrl(UUID groupId, UUID memberId) {
        return GROUPS_URL + "/" + groupId + "/members/" + memberId;
    }

    private UUID newUser(String name) {
        User user = User.register(name, Email.of("grp-" + UUID.randomUUID() + "@example.com"), "hash-da-senha",
                Currency.getInstance("BRL"));
        return users.save(user).getId();
    }

    private JwtRequestPostProcessor asUser(UUID userId) {
        return jwt().jwt(token -> token.subject(userId.toString()));
    }
}
