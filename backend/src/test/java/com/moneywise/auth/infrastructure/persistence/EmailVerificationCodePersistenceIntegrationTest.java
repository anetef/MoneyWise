package com.moneywise.auth.infrastructure.persistence;


import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Currency;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import com.moneywise.TestcontainersConfiguration;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceException;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class EmailVerificationCodePersistenceIntegrationTest {

    @Autowired
    private SpringDataEmailVerificationCodeRepository codes;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    private UUID existingUserId() {
        User user = User.register("Maria", Email.of("maria@gmail.com"), "hash-da-senha", Currency.getInstance("BRL"));
        userRepository.save(user);
        return user.getId();
    }

    private void flushAndClear() {
        entityManager.flush();
        entityManager.clear();
    }

    private EmailVerificationCodeEntity newCode(UUID userId, String hash) {
        Instant now = Instant.now().truncatedTo(ChronoUnit.MICROS);
        return new EmailVerificationCodeEntity(UUID.randomUUID(), userId, hash, now.plus(Duration.ofMinutes(15)), now);
    }

    @Test
    @DisplayName("Grava o código e encontra pelo usuário")
    void shouldSaveAndFindByUserId() {
        UUID userId = existingUserId();
        codes.save(newCode(userId, "a".repeat(64)));
        flushAndClear();

        assertThat(codes.findByUserId(userId))
                .hasValueSatisfying(saved -> {
                    assertThat(saved.getCodeHash()).isEqualTo("a".repeat(64));
                    assertThat(saved.getAttempts()).isZero();
                });
    }

        @Test
    @DisplayName("Atualiza a mesma linha com novo hash e tentativas")
    void shouldUpdateCode() {
        UUID userId = existingUserId();
        codes.save(newCode(userId, "a".repeat(64)));
        flushAndClear();

        EmailVerificationCodeEntity loaded = codes.findByUserId(userId).orElseThrow();
        Instant now = Instant.now().truncatedTo(ChronoUnit.MICROS);
        loaded.update("b".repeat(64), now.plus(Duration.ofMinutes(15)), 2, now);
        flushAndClear();

        assertThat(codes.findAll())
                .singleElement()
                .satisfies(saved -> {
                    assertThat(saved.getCodeHash()).isEqualTo("b".repeat(64));
                    assertThat(saved.getAttempts()).isEqualTo(2);
                });
    }

    @Test
    @DisplayName("Não permite dois códigos para o mesmo usuário")
    void shouldRejectSecondCodeForSameUser() {
        UUID userId = existingUserId();
        codes.save(newCode(userId, "a".repeat(64)));
        flushAndClear();

        codes.save(newCode(userId, "b".repeat(64)));

        assertThatThrownBy(this::flushAndClear).isInstanceOf(PersistenceException.class);
    }

    @Test
    @DisplayName("Apaga o código pelo usuário")
    void shouldDeleteByUserId() {
        UUID userId = existingUserId();
        codes.save(newCode(userId, "a".repeat(64)));
        flushAndClear();

        codes.deleteByUserId(userId);
        flushAndClear();

        assertThat(codes.findByUserId(userId)).isEmpty();
    }
}
