package com.moneywise.auth.presentation;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import jakarta.persistence.EntityManager;
import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
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
class RefreshLogoutIntegrationTest {

    private static final String EMAIL = "maria@gmail.com";
    private static final String PASSWORD = "senha12345";

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    // ---------- Auxiliares ----------

    private ResultActions postJson(String url, String body) throws Exception {
        return mockMvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(body));
    }

    /** Cadastra, confirma o e-mail direto no banco e faz login. Devolve o refresh token. */
    private String loginAndGetRefreshToken() throws Exception {
        postJson("/api/v1/auth/register", """
                {"name":"Maria","email":"%s","password":"%s","currency":"BRL"}
                """.formatted(EMAIL, PASSWORD))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail(Email.of(EMAIL)).orElseThrow();
        user.markEmailVerified(Instant.now());
        userRepository.save(user);

        String body = postJson("/api/v1/auth/login", """
                {"email":"%s","password":"%s"}
                """.formatted(EMAIL, PASSWORD))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.refreshToken");
    }

    private ResultActions refresh(String refreshToken) throws Exception {
        return postJson("/api/v1/auth/refresh", """
                {"refreshToken":"%s"}
                """.formatted(refreshToken));
    }

    private ResultActions logout(String refreshToken) throws Exception {
        return postJson("/api/v1/auth/logout", """
                {"refreshToken":"%s"}
                """.formatted(refreshToken));
    }

    // ---------- Refresh (SEC-07) ----------

    @Test
    @DisplayName("Refresh válido → 200 com novo access token, que funciona nas rotas protegidas")
    void shouldRefresh() throws Exception {
        String refreshToken = loginAndGetRefreshToken();

        String body = refresh(refreshToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andReturn().getResponse().getContentAsString();

        String newAccessToken = JsonPath.read(body, "$.accessToken");
        // 404 = passou pela segurança (a rota não existe); sem token válido seria 401.
        mockMvc.perform(get("/api/v1/qualquer-coisa").header("Authorization", "Bearer " + newAccessToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Rotação: o refresh token já usado → 401")
    void shouldRejectReusedRefreshToken() throws Exception {
        String refreshToken = loginAndGetRefreshToken();
        refresh(refreshToken).andExpect(status().isOk());

        refresh(refreshToken)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_REFRESH_TOKEN"));
    }

    @Test
    @DisplayName("Refresh inválido → 401")
    void shouldRejectInvalidRefreshToken() throws Exception {
        refresh("token-que-nao-existe")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_REFRESH_TOKEN"));
    }

   
    @Test
    @DisplayName("Refresh vencido → 401")
    void shouldRejectExpiredRefreshToken() throws Exception {
        String refreshToken = loginAndGetRefreshToken();

        entityManager.flush();   // envia o INSERT pendente do refresh token ao banco
        jdbcTemplate.update("UPDATE refresh_tokens SET expires_at = now() - interval '1 minute'");
        entityManager.clear();   // descarta a cópia em memória com o expires_at antigo

        refresh(refreshToken)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_REFRESH_TOKEN"));
    }

    @Test
    @DisplayName("Refresh vazio → 400")
    void shouldRejectBlankRefreshToken() throws Exception {
        refresh("").andExpect(status().isBadRequest());
    }

    // ---------- Logout (SEC-08) ----------

    @Test
    @DisplayName("Login → logout → refresh com o token antigo → 401")
    void shouldRejectRefreshAfterLogout() throws Exception {
        String refreshToken = loginAndGetRefreshToken();

        logout(refreshToken).andExpect(status().isNoContent());

        refresh(refreshToken)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_REFRESH_TOKEN"));
    }

    @Test
    @DisplayName("Logout com token desconhecido → 204")
    void shouldReturn204ForUnknownToken() throws Exception {
        logout("token-que-nao-existe").andExpect(status().isNoContent());
    }
}