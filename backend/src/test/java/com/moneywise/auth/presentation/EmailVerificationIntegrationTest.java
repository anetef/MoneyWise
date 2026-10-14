package com.moneywise.auth.presentation;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
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

import com.moneywise.TestcontainersConfiguration;
import com.moneywise.auth.application.port.EmailVerificationCodeRepository;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.EmailVerificationCode;
import com.moneywise.auth.domain.User;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class EmailVerificationIntegrationTest {

    private static final String EMAIL = "maria@gmail.com";
    private static final String PASSWORD = "senha12345";
    private static final String KNOWN_CODE = "123456";

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailVerificationCodeRepository codes;

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

    /** Cadastra pela API e troca o código sorteado por um conhecido. */
    private void registerWithKnownCode() throws Exception {
        postJson("/api/v1/auth/register", """
                {"name":"Maria","email":"%s","password":"%s","currency":"BRL"}
                """.formatted(EMAIL, PASSWORD))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail(Email.of(EMAIL)).orElseThrow();
        EmailVerificationCode code = codes.findByUserId(user.getId()).orElseThrow();
        code.replace(KNOWN_CODE, Instant.now());
        codes.save(code);
    }

    private ResultActions verify(String email, String code) throws Exception {
        return postJson("/api/v1/auth/verify-email", """
                {"email":"%s","code":"%s"}
                """.formatted(email, code));
    }

    private ResultActions resend(String email) throws Exception {
        return postJson("/api/v1/auth/resend-verification", """
                {"email":"%s"}
                """.formatted(email));
    }

    // ---------- Verificação ----------

    @Test
    @DisplayName("Código certo: 200 com tokens e e-mail confirmado; depois o login funciona")
    void shouldVerifyAndThenLogin() throws Exception {
        registerWithKnownCode();

        verify(EMAIL, KNOWN_CODE)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.user.emailVerified").value(true));

        postJson("/api/v1/auth/login", """
                {"email":"%s","password":"%s"}
                """.formatted(EMAIL, PASSWORD))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Código errado: 422 INVALID_VERIFICATION_CODE")
    void shouldRejectWrongCode() throws Exception {
        registerWithKnownCode();

        verify(EMAIL, "000000")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("INVALID_VERIFICATION_CODE"));
    }

    @Test
    @DisplayName("Código fora do formato: 400 e não conta como tentativa")
    void shouldRejectMalformedCode() throws Exception {
        registerWithKnownCode();

        verify(EMAIL, "12ab")
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Confirmar de novo: 409 EMAIL_ALREADY_VERIFIED")
    void shouldRejectSecondVerification() throws Exception {
        registerWithKnownCode();
        verify(EMAIL, KNOWN_CODE).andExpect(status().isOk());

        verify(EMAIL, KNOWN_CODE)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_VERIFIED"));
    }

    // ---------- Reenvio ----------

    @Test
    @DisplayName("Reenvio logo depois do cadastro: 429")
    void shouldRejectResendTooSoon() throws Exception {
        registerWithKnownCode();

        resend(EMAIL)
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("VERIFICATION_RESEND_TOO_SOON"));
    }

    @Test
    @DisplayName("Reenvio para e-mail desconhecido: 204, sem revelar nada")
    void shouldReturn204ForUnknownEmail() throws Exception {
        resend("ninguem@gmail.com")
                .andExpect(status().isNoContent());
    }
}
