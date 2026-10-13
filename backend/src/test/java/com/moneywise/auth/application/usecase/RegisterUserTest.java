package com.moneywise.auth.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Currency;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;
import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ConflictException;

class RegisterUserTest {

    private final FakeUserRepository userRepository = new FakeUserRepository();
    private final RegisterUser registerUser = new RegisterUser(userRepository, new FakePasswordHasher());

    private RegisterUserCommand command(String email) {
        return new RegisterUserCommand("Maria", email, "senha12345", "BRL");
    }

    @Test
    @DisplayName("Cadastra um usuário com os dados informados")
    void shouldRegisterUser() {
        User user = registerUser.execute(command("Maria@Gmail.com"));

        assertThat(user.getId()).isNotNull();
        assertThat(user.getName()).isEqualTo("Maria");
        assertThat(user.getEmail()).isEqualTo(Email.of("maria@gmail.com"));
        assertThat(user.getCurrency()).isEqualTo(Currency.getInstance("BRL"));
        assertThat(userRepository.findById(user.getId())).hasValue(user);
    }

    @Test
    @DisplayName("Um usuário recém-cadastrado tem o e-mail não confirmado")
    void shouldRegisterWithEmailNotVerified() {
        User user = registerUser.execute(command("maria@gmail.com"));

        assertThat(user.isEmailVerified()).isFalse();
    }

    @Test
    @DisplayName("Guarda o hash da senha, nunca a senha")
    void shouldStorePasswordHash() {
        User user = registerUser.execute(command("maria@gmail.com"));

        assertThat(user.getPasswordHash())
                .isEqualTo("hashed:senha12345")
                .isNotEqualTo("senha12345");
    }

    @Test
    @DisplayName("Recusa e-mail já cadastrado, mesmo com maiúsculas diferentes (RN06)")
    void shouldRejectDuplicateEmail() {
        registerUser.execute(command("maria@gmail.com"));

        assertThatThrownBy(() -> registerUser.execute(command("MARIA@gmail.com")))
                .isInstanceOf(ConflictException.class)
                .hasFieldOrPropertyWithValue("code", RegisterUser.EMAIL_ALREADY_IN_USE)
                .hasMessage("Este e-mail já está cadastrado.");
        assertThat(userRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("Recusa moeda que não existe (RN09)")
    void shouldRejectInvalidCurrency() {
        RegisterUserCommand command = new RegisterUserCommand("Maria", "maria@gmail.com", "senha12345", "XYZ");

        assertThatThrownBy(() -> registerUser.execute(command))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", RegisterUser.INVALID_CURRENCY);
        assertThat(userRepository.count()).isZero();
    }

    @Test
    @DisplayName("Recusa e-mail inválido sem salvar nada")
    void shouldRejectInvalidEmail() {
        assertThatThrownBy(() -> registerUser.execute(command("nao-e-email")))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", Email.INVALID_CODE);
        assertThat(userRepository.count()).isZero();
    }
}
