package com.moneywise.auth.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.moneywise.shared.exception.BusinessRuleException;
import java.util.Currency;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Description;

public class UserTest {
    User user = User.register("Maria", Email.of("maria@gmail.com"), "hash-da-senha", Currency.getInstance("BRL"));

    @Test
    @Description("Deve criar e registrar usuário com o id e os dados nao nulos")
    void shouldRegisterAndCreatesUserWithGeneratedIdAndProvidedData() {
        Email email = Email.of("maria@gmail.com");
        Currency currency = Currency.getInstance("BRL");

        User user = User.register("Maria", email, "hash-da-senha", currency);

        assertNotNull(user.getId());
        assertEquals("Maria", user.getName());
        assertEquals(email, user.getEmail());
        assertEquals("hash-da-senha", user.getPasswordHash());
        assertEquals(currency, user.getCurrency());
    }

    @Test
    @Description("Dois registros devem gerar IDs diferentes")
    void shouldGenerateDifferentIdsForTwoRegistrations() {
        Currency currency = Currency.getInstance("BRL");
        Email email = Email.of("maria@gmail.com");

        User firstUser = User.register("Maria", email, "hash-da-senha", currency);
        User secondUser = User.register("Maria", email, "hash-da-senha", currency);

        assertNotNull(firstUser.getId());
        assertNotNull(secondUser.getId());
        assertNotEquals(firstUser.getId(), secondUser.getId());
    }

    @Test
    @Description("Deve remover os espaços das pontas do nome")
    void shouldTrimNameWhenRegisteringUser() {
        User user = User.register(
            " Maria ",
            Email.of("maria@gmail.com"),
            "hash-da-senha",
            Currency.getInstance("BRL")
        );

        assertEquals("Maria", user.getName());
    }

    @Test
    @Description("Deve recusar nome vazio")
    void shouldRejectEmptyName() {
        BusinessRuleException exception = assertThrows(
            BusinessRuleException.class,
            () -> User.register(
                "",
                Email.of("maria@gmail.com"),
                "hash-da-senha",
                Currency.getInstance("BRL")
            )
        );

        assertEquals("INVALID_NAME", exception.getCode());
    }

    @Test
    @Description("Deve recusar nome com mais de 100 caracteres")
    void shouldRejectNameLongerThan100Characters() {
        String name = "a".repeat(101);

        BusinessRuleException exception = assertThrows(
            BusinessRuleException.class,
            () -> User.register(
                name,
                Email.of("maria@gmail.com"),
                "hash-da-senha",
                Currency.getInstance("BRL")
            )
        );

        assertEquals("INVALID_NAME", exception.getCode());
    }

    @Test
    @Description("Deve aceitar nome com exatamente 100 caracteres")
    void shouldAcceptNameWithExactly100Characters() {
        String name = "a".repeat(100);

        User user = User.register(
            name,
            Email.of("maria@gmail.com"),
            "hash-da-senha",
            Currency.getInstance("BRL")
        );

        assertEquals(100, user.getName().length());
        assertEquals(name, user.getName());
    }

    @Test
    @Description("Deve recusar hash de senha vazio")
    void shouldRejectEmptyPasswordHash() {
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> User.register(
                "Maria",
                Email.of("maria@gmail.com"),
                "",
                Currency.getInstance("BRL")
            )
        );

        assertEquals("O hash da senha é obrigatório.", exception.getMessage());
    }

    @Test
    @Description("Deve manter o ID informado ao restaurar usuário")
    void shouldRestoreUserWithProvidedId() {
        UUID id = UUID.randomUUID();
        Email email = Email.of("maria@gmail.com");
        Currency currency = Currency.getInstance("BRL");

        User user = User.restore(
            id,
            "Maria",
            email,
            "hash-da-senha",
            currency
        );

        assertEquals(id, user.getId());
    }

    @Test
    @Description("Dois usuários com o mesmo ID são iguais, mesmo com nomes diferentes")
    void shouldConsiderUsersWithSameIdAsEqual() {
        UUID id = UUID.randomUUID();
        Email email = Email.of("maria@gmail.com");
        Currency currency = Currency.getInstance("BRL");

        User firstUser = User.restore(
            id,
            "Maria",
            email,
            "hash-da-senha",
            currency
        );

        User secondUser = User.restore(
            id,
            "João",
            email,
            "outro-hash",
            currency
        );

        assertEquals(firstUser, secondUser);
    }

    @Test
    @Description("O toString não deve conter o hash da senha")
    void shouldNotExposePasswordHashInToString() {
        User user = User.register(
            "Maria",
            Email.of("maria@gmail.com"),
            "hash-da-senha",
            Currency.getInstance("BRL")
        );

        assertThat(user.toString()).doesNotContain("hash-da-senha");
    }

}
