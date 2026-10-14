package com.moneywise.auth.presentation;


import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
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
class AuthControllerIntegrationTest {

    private static final String REGISTER_URL = "/api/v1/auth/register";
    private static final String LOGIN_URL = "/api/v1/auth/login";
    private static final String PASSWORD = "senha12345";

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    // ---------- Auxiliares ----------

    private ResultActions register(String name, String email, String password, String currency) throws Exception {
        String body = """
                {"name":"%s","email":"%s","password":"%s","currency":"%s"}
                """.formatted(name, email, password, currency);
        return mockMvc.perform(post(REGISTER_URL).contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private ResultActions login(String email, String password) throws Exception {
        String body = """
                {"email":"%s","password":"%s"}
                """.formatted(email, password);
        return mockMvc.perform(post(LOGIN_URL).contentType(MediaType.APPLICATION_JSON).content(body));
    }

    /** Simula a confirmação do e-mail, que ainda não tem endpoint. */
    private void verifyEmail(String email) {
        User user = userRepository.findByEmail(Email.of(email)).orElseThrow();
        user.markEmailVerified(Instant.now());
        userRepository.save(user);
    }

    // ---------- Cadastro (SEC-05) ----------

    @Test
    @DisplayName("Cadastro válido retorna 201 com o usuário, sem senha e sem tokens")
    void shouldRegister() throws Exception {
        register("Maria", "maria@gmail.com", PASSWORD, "BRL")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("Maria"))
                .andExpect(jsonPath("$.email").value("maria@gmail.com"))
                .andExpect(jsonPath("$.currency").value("BRL"))
                .andExpect(jsonPath("$.emailVerified").value(false))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.accessToken").doesNotExist());
    }

    @Test
    @DisplayName("E-mail já cadastrado retorna 409 com mensagem em português")
    void shouldReturn409ForDuplicateEmail() throws Exception {
        register("Maria", "maria@gmail.com", PASSWORD, "BRL");

        register("Outra Maria", "MARIA@gmail.com", PASSWORD, "BRL")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_IN_USE"))
                .andExpect(jsonPath("$.message").value("Este e-mail já está cadastrado."));
    }

    @Test
    @DisplayName("Dados inválidos retornam 400 com a lista de campos")
    void shouldReturn400WithInvalidFields() throws Exception {
        register("", "nao-e-email", "123", "BRL")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fields", hasSize(3)));
    }

    @Test
    @DisplayName("Moeda inexistente retorna 422")
    void shouldReturn422ForUnknownCurrency() throws Exception {
        register("Maria", "maria@gmail.com", PASSWORD, "XYZ")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("INVALID_CURRENCY"));
    }

    // ---------- Login (SEC-06) ----------

    @Test
    @DisplayName("Login antes de confirmar o e-mail retorna 403")
    void shouldReturn403WhenEmailNotVerified() throws Exception {
        register("Maria", "maria@gmail.com", PASSWORD, "BRL");

        login("maria@gmail.com", PASSWORD)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("EMAIL_NOT_VERIFIED"))
                .andExpect(jsonPath("$.accessToken").doesNotExist());
    }

    @Test
    @DisplayName("Credenciais válidas retornam 200 com os tokens e o usuário")
    void shouldLogin() throws Exception {
        register("Maria", "maria@gmail.com", PASSWORD, "BRL");
        verifyEmail("maria@gmail.com");

        login("maria@gmail.com", PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("maria@gmail.com"))
                .andExpect(jsonPath("$.user.emailVerified").value(true))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("Senha errada e e-mail inexistente retornam o mesmo 401")
    void shouldReturnSame401ForWrongPasswordAndUnknownEmail() throws Exception {
        register("Maria", "maria@gmail.com", PASSWORD, "BRL");
        verifyEmail("maria@gmail.com");

        login("maria@gmail.com", "senha-errada")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
                .andExpect(jsonPath("$.message").value("E-mail ou senha inválidos."));

        login("ninguem@gmail.com", PASSWORD)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
                .andExpect(jsonPath("$.message").value("E-mail ou senha inválidos."));
    }

    @Test
    @DisplayName("Login com campos vazios retorna 400")
    void shouldReturn400ForEmptyLogin() throws Exception {
        login("", "")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    // ---------- Fluxo completo ----------

    @Test
    @DisplayName("Fluxo completo: cadastro, confirmação, login e uso do token numa rota protegida")
    void shouldUseAccessTokenFromLogin() throws Exception {
        register("Maria", "maria@gmail.com", PASSWORD, "BRL");
        verifyEmail("maria@gmail.com");

        String response = login("maria@gmail.com", PASSWORD)
                .andReturn().getResponse().getContentAsString();
        String accessToken = JsonPath.read(response, "$.accessToken");

        // Sem token: barrado
        mockMvc.perform(get("/api/v1/qualquer-coisa"))
                .andExpect(status().isUnauthorized());

        // Com o token do login: passa pela segurança (404 só porque a rota não existe)
        mockMvc.perform(get("/api/v1/qualquer-coisa").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound());
    }
}