package com.moneywise.auth.presentation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;
import java.time.Instant;
import java.util.Currency;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.jayway.jsonpath.JsonPath;
import com.moneywise.TestcontainersConfiguration;
import com.moneywise.auth.application.port.EmailSender;
import com.moneywise.auth.application.port.PasswordHasher;
import com.moneywise.auth.application.port.PasswordResetCodeRepository;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.PasswordResetCode;
import com.moneywise.auth.domain.User;

/**
 * SEC-09: recuperação de senha pela API, com banco real (Testcontainers).
 * O EmailSender é trocado por um mock: assim o teste confere quem recebeu e-mail e pega o código enviado.
 */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class PasswordResetIntegrationTest {

    private static final String EMAIL = "maria.reset@gmail.com";
    private static final String OLD_PASSWORD = "senhaAntiga123";
    private static final String NEW_PASSWORD = "senhaNova12345";

    @Autowired private WebApplicationContext context;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordHasher passwordHasher;
    @Autowired private PasswordResetCodeRepository codes;

    @MockitoBean private EmailSender emailSender;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    // ---------- Auxiliares ----------

    private ResultActions postJson(String url, String body) throws Exception {
        return mockMvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(body));
    }

    /** Usuário com e-mail confirmado, gravado direto no banco com a senha antiga (BCrypt real). */
    private User existingUser() {
        User user = User.register("Maria", Email.of(EMAIL), passwordHasher.hash(OLD_PASSWORD),
                Currency.getInstance("BRL"));
        user.markEmailVerified(Instant.now());
        return userRepository.save(user);
    }

    private ResultActions login(String password) throws Exception {
        return postJson("/api/v1/auth/login", """
                {"email":"%s","password":"%s"}
                """.formatted(EMAIL, password));
    }

    private ResultActions forgot(String email) throws Exception {
        return postJson("/api/v1/auth/password/forgot", """
                {"email":"%s"}
                """.formatted(email));
    }

    private ResultActions verifyCode(String code) throws Exception {
        return postJson("/api/v1/auth/password/verify-code", """
                {"email":"%s","code":"%s"}
                """.formatted(EMAIL, code));
    }

    private ResultActions reset(String code, String newPassword) throws Exception {
        return postJson("/api/v1/auth/password/reset", """
                {"email":"%s","code":"%s","newPassword":"%s"}
                """.formatted(EMAIL, code, newPassword));
    }

    /** Pede o código pela API e devolve o código que foi "enviado" por e-mail (capturado do mock). */
    private String requestCode() throws Exception {
        forgot(EMAIL).andExpect(status().isNoContent());
        ArgumentCaptor<String> code = ArgumentCaptor.forClass(String.class);
        verify(emailSender).sendPasswordResetCode(eq(EMAIL), anyString(), code.capture(), any(Duration.class));
        return code.getValue();
    }

    /** Um código de 6 dígitos diferente do certo. */
    private static String wrongCode(String rightCode) {
        return rightCode.equals("000000") ? "111111" : "000000";
    }

    // ---------- forgot ----------

    @Test
    @DisplayName("forgot: 204 para e-mail cadastrado e não cadastrado; só o cadastrado recebe e-mail")
    void forgotAlwaysAnswers204ButOnlySendsToExistingAccount() throws Exception {
        existingUser();

        forgot(EMAIL).andExpect(status().isNoContent());
        forgot("ninguem.aqui@gmail.com").andExpect(status().isNoContent());

        verify(emailSender, times(1))
                .sendPasswordResetCode(eq(EMAIL), anyString(), anyString(), any(Duration.class));
        verify(emailSender, never())
                .sendPasswordResetCode(eq("ninguem.aqui@gmail.com"), anyString(), anyString(), any(Duration.class));
    }

    @Test
    @DisplayName("forgot: e-mail mal formatado → 400")
    void forgotRejectsInvalidEmail() throws Exception {
        forgot("isso-nao-e-email").andExpect(status().isBadRequest());
    }

    // ---------- fluxo completo ----------

    @Test
    @DisplayName("Código certo: troca a senha; login antigo falha, novo funciona; refresh antigo → 401")
    void fullFlowChangesPasswordAndRevokesSessions() throws Exception {
        existingUser();
        String loginBody = login(OLD_PASSWORD).andExpect(status().isOk()).andReturn().getResponse()
                .getContentAsString();
        String oldRefreshToken = JsonPath.read(loginBody, "$.refreshToken");

        String code = requestCode();
        verifyCode(code).andExpect(status().isNoContent());
        reset(code, NEW_PASSWORD).andExpect(status().isNoContent());

        login(OLD_PASSWORD).andExpect(status().isUnauthorized());
        login(NEW_PASSWORD).andExpect(status().isOk());
        postJson("/api/v1/auth/refresh", """
                {"refreshToken":"%s"}
                """.formatted(oldRefreshToken))
                .andExpect(status().isUnauthorized());
    }

    // ---------- código inválido ----------

    @Test
    @DisplayName("Código errado → 422 INVALID_RESET_CODE e a senha não muda")
    void wrongCodeIsRejected() throws Exception {
        existingUser();
        String code = requestCode();

        verifyCode(wrongCode(code))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("INVALID_RESET_CODE"));
        reset(wrongCode(code), NEW_PASSWORD)
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("INVALID_RESET_CODE"));

        login(OLD_PASSWORD).andExpect(status().isOk());
    }

    @Test
    @DisplayName("Código vencido → 422 INVALID_RESET_CODE")
    void expiredCodeIsRejected() throws Exception {
        User user = existingUser();
        String code = requestCode();

        // Faz o código vencer: grava de novo com a validade 1 segundo no passado.
        PasswordResetCode saved = codes.findByUserId(user.getId()).orElseThrow();
        codes.save(PasswordResetCode.restore(saved.getId(), saved.getUserId(), saved.getCodeHash(),
                Instant.now().minusSeconds(1), saved.getAttempts(), saved.getLastSentAt(), saved.getUsedAt()));

        reset(code, NEW_PASSWORD)
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("INVALID_RESET_CODE"));
    }

    @Test
    @DisplayName("Código já usado → 422 INVALID_RESET_CODE")
    void usedCodeIsRejected() throws Exception {
        existingUser();
        String code = requestCode();
        reset(code, NEW_PASSWORD).andExpect(status().isNoContent());

        reset(code, "outraSenha12345")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("INVALID_RESET_CODE"));
        login(NEW_PASSWORD).andExpect(status().isOk());
    }

    @Test
    @DisplayName("Depois de 5 tentativas erradas, o código certo também é recusado")
    void codeIsInvalidatedAfterFiveWrongAttempts() throws Exception {
        User user = existingUser();
        String code = requestCode();

        for (int i = 0; i < 5; i++) {
            verifyCode(wrongCode(code)).andExpect(status().isUnprocessableContent());
        }
        assertThat(codes.findByUserId(user.getId()).orElseThrow().getAttempts()).isEqualTo(5);

        verifyCode(code).andExpect(status().isUnprocessableContent());
        reset(code, NEW_PASSWORD).andExpect(status().isUnprocessableContent());
        login(OLD_PASSWORD).andExpect(status().isOk());
    }

    // ---------- validação ----------

    @Test
    @DisplayName("Senha nova curta ou código fora do formato → 400, sem gastar tentativa")
    void invalidFieldsAreRejectedWith400() throws Exception {
        User user = existingUser();
        String code = requestCode();

        reset(code, "curta").andExpect(status().isBadRequest());
        verifyCode("12ab").andExpect(status().isBadRequest());

        assertThat(codes.findByUserId(user.getId()).orElseThrow().getAttempts()).isZero();
    }
}