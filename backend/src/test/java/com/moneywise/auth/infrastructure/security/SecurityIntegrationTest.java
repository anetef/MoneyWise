package com.moneywise.auth.infrastructure.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.internal.matchers.Null;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;

import com.moneywise.TestcontainersConfiguration;
import com.moneywise.shared.web.CurrentUserId;

@SpringBootTest
@Import({ TestcontainersConfiguration.class, SecurityIntegrationTest.ProbeController.class })
class SecurityIntegrationTest {

    /** Controller que só existe no teste: devolve o userId que o @CurrentUserId leu do token. */
    @RestController
    static class ProbeController {

        @GetMapping("/test/me")
        Map<String, String> me(@CurrentUserId UUID userId) {
            return Map.of("userId", userId.toString());
        }
    }

    private static final String PROTECTED_URL = "/api/v1/test/me";

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JwtTokenService tokenService;

    @Autowired
    private JwtEncoder encoder;

    @Autowired
    private JwtDecoder decoder;

    @Autowired
    private JwtProperties properties;

    @Autowired
    private RefreshTokenStore refreshTokenStore;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    // ---------- Rotas protegidas ----------

    @Test
    @DisplayName("Rota protegida sem token retorna 401 no formato da API")
    void shouldReturn401WithoutToken() throws Exception {
        mockMvc.perform(get(PROTECTED_URL))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.fields").isEmpty());
    }

    @Test
    @DisplayName("Token inválido retorna 401")
    void shouldReturn401WithInvalidToken() throws Exception {
        mockMvc.perform(get(PROTECTED_URL).header("Authorization", bearer("isso-nao-e-um-token")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Token expirado retorna 401")
    void shouldReturn401WithExpiredToken() throws Exception {
        Clock oneHourAgo = Clock.fixed(Instant.now().minus(1, ChronoUnit.HOURS), ZoneOffset.UTC);
        String expired = new JwtTokenService(encoder, decoder, properties, refreshTokenStore, oneHourAgo)
                .issueAccessToken(UUID.randomUUID());

        mockMvc.perform(get(PROTECTED_URL).header("Authorization", bearer(expired)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Token assinado com outro segredo retorna 401")
    void shouldReturn401WithTokenFromAnotherSecret() throws Exception {
        JwtConfig config = new JwtConfig();
        JwtProperties otherProperties = new JwtProperties(
                "um-segredo-completamente-diferente-com-32-caracteres", Duration.ofMinutes(15), null);
        SecretKey otherKey = config.jwtSecretKey(otherProperties);
        String foreign = new JwtTokenService(
                config.jwtEncoder(otherKey), config.jwtDecoder(otherKey), otherProperties,
                refreshTokenStore, Clock.systemUTC())
                .issueAccessToken(UUID.randomUUID());

        mockMvc.perform(get(PROTECTED_URL).header("Authorization", bearer(foreign)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Token válido passa, e o controller recebe o userId do próprio token")
    void shouldAllowValidTokenAndResolveUserId() throws Exception {
        UUID userId = UUID.randomUUID();
        String token = tokenService.issueAccessToken(userId);

        mockMvc.perform(get(PROTECTED_URL).header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(userId.toString()));
    }

    @Test
    @DisplayName("O caminho /ws também exige token (coerente com GOAL-07)")
    void shouldRequireTokenOnWebSocketPath() throws Exception {
        mockMvc.perform(get("/ws"))
                .andExpect(status().isUnauthorized());
    }

    // ---------- Rotas públicas ----------

    @Test
    @DisplayName("Cadastro, login e refresh não exigem access token")
    void shouldNotRequireTokenOnPublicRoutes() throws Exception {
        for (String url : new String[] { "/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/refresh" }) {
            int status = mockMvc.perform(post(url)).andReturn().getResponse().getStatus();

            // Os controllers ainda não existem (SEC-05), então a resposta não é 200.
            // O que importa aqui: o segurança deixou passar, então NÃO é 401.
            assertThat(status).as("POST %s", url).isNotEqualTo(401);
        }
    }

    // ---------- Documentação ----------

    @Test
    @DisplayName("No perfil dev, a documentação da API abre sem token")
    void shouldExposeDocsWithoutTokenInDev() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk());
    }
}
