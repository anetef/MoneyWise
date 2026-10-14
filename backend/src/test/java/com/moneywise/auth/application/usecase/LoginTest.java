package com.moneywise.auth.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.Currency;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;
import com.moneywise.shared.exception.ForbiddenOperationException;
import com.moneywise.shared.exception.UnauthorizedException;

class LoginTest {

    private static final String PASSWORD = "senha12345";

    private final FakeUserRepository userRepository = new FakeUserRepository();
    private final FakePasswordHasher passwordHasher = new FakePasswordHasher();
    private final FakeTokenService tokenService = new FakeTokenService();
    private final Login login = new Login(userRepository, passwordHasher, tokenService);

    /** Cria e salva um usuário com a senha PASSWORD, confirmado ou não. */
    private User existingUser(boolean emailVerified) {
        User user = User.register("Maria", Email.of("maria@gmail.com"), passwordHasher.hash(PASSWORD),
                Currency.getInstance("BRL"));
        if (emailVerified) {
            user.markEmailVerified(Instant.parse("2026-10-13T12:00:00Z"));
        }
        return userRepository.save(user);
    }

    @Test
    @DisplayName("Credenciais válidas e e-mail confirmado devolvem os tokens e o usuário")
    void shouldLoginWithValidCredentials() {
        User user = existingUser(true);

        LoginResult result = login.execute(new LoginCommand("maria@gmail.com", PASSWORD));

        assertThat(result.user()).isEqualTo(user);
        assertThat(result.accessToken()).isEqualTo("access-" + user.getId());
        assertThat(result.refreshToken()).isEqualTo("refresh-" + user.getId());
    }

    @Test
    @DisplayName("O e-mail do login não diferencia maiúsculas e minúsculas")
    void shouldLoginWithEmailInAnyCase() {
        existingUser(true);

        LoginResult result = login.execute(new LoginCommand("MARIA@Gmail.com", PASSWORD));

        assertThat(result.accessToken()).isNotBlank();
    }

    @Test
    @DisplayName("Senha errada retorna 401 com mensagem genérica")
    void shouldRejectWrongPassword() {
        existingUser(true);

        assertThatThrownBy(() -> login.execute(new LoginCommand("maria@gmail.com", "senha-errada")))
                .isInstanceOf(UnauthorizedException.class)
                .hasFieldOrPropertyWithValue("code", Login.INVALID_CREDENTIALS)
                .hasMessage("E-mail ou senha inválidos.");
        assertThat(tokenService.issuedCount()).isZero();
    }

    @Test
    @DisplayName("E-mail inexistente retorna exatamente o mesmo erro da senha errada")
    void shouldRejectUnknownEmailWithSameError() {
        existingUser(true);

        assertThatThrownBy(() -> login.execute(new LoginCommand("joao@gmail.com", PASSWORD)))
                .isInstanceOf(UnauthorizedException.class)
                .hasFieldOrPropertyWithValue("code", Login.INVALID_CREDENTIALS)
                .hasMessage("E-mail ou senha inválidos.");
        assertThat(tokenService.issuedCount()).isZero();
    }

    @Test
    @DisplayName("E-mail em formato inválido também retorna o 401 genérico")
    void shouldRejectMalformedEmailWithSameError() {
        assertThatThrownBy(() -> login.execute(new LoginCommand("nao-e-email", PASSWORD)))
                .isInstanceOf(UnauthorizedException.class)
                .hasFieldOrPropertyWithValue("code", Login.INVALID_CREDENTIALS);
    }

    @Test
    @DisplayName("Senha certa, mas e-mail não confirmado, retorna 403 sem emitir tokens")
    void shouldRejectUnverifiedEmail() {
        existingUser(false);

        assertThatThrownBy(() -> login.execute(new LoginCommand("maria@gmail.com", PASSWORD)))
                .isInstanceOf(ForbiddenOperationException.class)
                .hasFieldOrPropertyWithValue("code", Login.EMAIL_NOT_VERIFIED);
        assertThat(tokenService.issuedCount()).isZero();
    }

    @Test
    @DisplayName("Senha errada num e-mail não confirmado retorna 401, sem revelar que a conta existe")
    void shouldNotRevealUnverifiedAccountWithWrongPassword() {
        existingUser(false);

        assertThatThrownBy(() -> login.execute(new LoginCommand("maria@gmail.com", "senha-errada")))
                .isInstanceOf(UnauthorizedException.class)
                .hasFieldOrPropertyWithValue("code", Login.INVALID_CREDENTIALS);
    }
}