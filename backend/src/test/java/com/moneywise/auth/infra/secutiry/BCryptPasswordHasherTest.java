package com.moneywise.auth.infra.secutiry;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Description;
import static org.junit.jupiter.api.Assertions.assertTrue;
import com.moneywise.auth.infrastructure.security.BCryptPasswordHasher;

class BCryptPasswordHasherTest {

    @Test
    @Description ("O hash é diferente da senha original.")
    void shouldHashBeDifferentFromOriginalPassword() {
        // Arrange
        BCryptPasswordHasher passwordHasher = new BCryptPasswordHasher();
        String rawPassword = "SenhaSegura123!";

        // Act
        String passwordHash = passwordHasher.hash(rawPassword);

        // Assert
        assertNotNull(passwordHash);
        assertNotEquals(rawPassword, passwordHash);
        assertTrue(passwordHash.startsWith("$2a$"), "O hash BCrypt deve começar com $2a$.");
    }

    @Test
    @Description("matches retorna true para a senha correta.")
    void shouldMatchReturnTrueForCorrectPassword() {
        // Arrange
        BCryptPasswordHasher passwordHasher = new BCryptPasswordHasher();
        String rawPassword = "SenhaSegura123!";
        String passwordHash = passwordHasher.hash(rawPassword);

        // Act
        boolean matches = passwordHasher.matches(rawPassword, passwordHash);

        // Assert
        assertTrue(matches);
    }

    @Test
    @Description("matches retorna false para uma senha incorreta.")
    void shouldMatchReturnFalseForIncorrectPassword() {
        // Arrange
        BCryptPasswordHasher passwordHasher = new BCryptPasswordHasher();
        String rawPassword = "SenhaSegura123!";
        String wrongPassword = "SenhaErrada456!";
        String passwordHash = passwordHasher.hash(rawPassword);

        // Act
        boolean matches = passwordHasher.matches(wrongPassword, passwordHash);

        // Assert
        assertFalse(matches);
    }

    @Test
    @Description("A mesma senha gera hashes diferentes, e ambos validam a senha original.")
    void shouldGenerateDifferentHashesThatBothMatchTheSamePassword() {
        // Arrange
        BCryptPasswordHasher passwordHasher = new BCryptPasswordHasher();
        String rawPassword = "SenhaSegura123!";

        // Act
        String firstHash = passwordHasher.hash(rawPassword);
        String secondHash = passwordHasher.hash(rawPassword);

        // Assert
        assertNotEquals(firstHash, secondHash);
        assertTrue(passwordHasher.matches(rawPassword, firstHash));
        assertTrue(passwordHasher.matches(rawPassword, secondHash));
    }

    @Test
    @Description("matches retorna false quando o hash é null.")
    void shouldMatchReturnFalseWhenHashIsNull() {
        // Arrange
        BCryptPasswordHasher passwordHasher = new BCryptPasswordHasher();
        String rawPassword = "SenhaSegura123!";

        // Act
        boolean matches = passwordHasher.matches(rawPassword, null);

        // Assert
        assertFalse(matches);
    }

    @Test
    @Description("hash lança NullPointerException quando a senha é null.")
    void shouldThrowNullPointerExceptionWhenPasswordIsNull() {
        // Arrange
        BCryptPasswordHasher passwordHasher = new BCryptPasswordHasher();

        // Act & Assert
        assertThrows(NullPointerException.class, () -> passwordHasher.hash(null));
    }

}
