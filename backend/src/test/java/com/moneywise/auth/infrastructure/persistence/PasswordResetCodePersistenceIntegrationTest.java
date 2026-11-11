package com.moneywise.auth.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Currency;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import com.moneywise.TestcontainersConfiguration;
import com.moneywise.auth.application.port.PasswordResetCodeRepository;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.PasswordResetCode;
import com.moneywise.auth.domain.User;

import jakarta.persistence.EntityManager;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class PasswordResetCodePersistenceIntegrationTest {

    @Autowired private PasswordResetCodeRepository codes;
    @Autowired private UserRepository userRepository;
    @Autowired private EntityManager entityManager;
    @Autowired private JdbcTemplate jdbc;

    private UUID existingUserId() {
        User user = User.register("Maria", Email.of("reset-" + UUID.randomUUID() + "@example.com"),
                "hash-da-senha", Currency.getInstance("BRL"));
        userRepository.save(user);
        return user.getId();
    }

    /** Envia ao banco o que está pendente e limpa o cache do Hibernate, para a leitura vir do banco. */
    private void flushAndClear() {
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("Grava e lê o código, só com o hash")
    void savesAndReads() {
        UUID userId = existingUserId();
        Instant now = Instant.now().truncatedTo(ChronoUnit.MICROS);
        PasswordResetCode code = PasswordResetCode.issue(userId, "123456", now);

        codes.save(code);
        flushAndClear();

        PasswordResetCode found = codes.findByUserId(userId).orElseThrow();
        assertThat(found.getId()).isEqualTo(code.getId());
        assertThat(found.matches("123456")).isTrue();
        assertThat(found.getCodeHash()).hasSize(64).isNotEqualTo("123456");
        assertThat(found.getExpiresAt()).isEqualTo(code.getExpiresAt());
        assertThat(found.getAttempts()).isZero();
        assertThat(found.getUsedAt()).isNull();
    }

    @Test
    @DisplayName("Atualiza tentativas e uso na mesma linha; um novo pedido não cria outra linha")
    void updatesSameRow() {
        UUID userId = existingUserId();
        Instant now = Instant.now().truncatedTo(ChronoUnit.MICROS);
        PasswordResetCode code = PasswordResetCode.issue(userId, "123456", now);
        codes.save(code);
        flushAndClear();

        PasswordResetCode found = codes.findByUserId(userId).orElseThrow();
        found.registerFailedAttempt();
        found.markUsed(now.plusSeconds(30));
        codes.save(found);
        flushAndClear();

        PasswordResetCode updated = codes.findByUserId(userId).orElseThrow();
        assertThat(updated.getAttempts()).isEqualTo(1);
        assertThat(updated.getUsedAt()).isEqualTo(now.plusSeconds(30));

        updated.replace("999999", now.plusSeconds(120));
        codes.save(updated);
        flushAndClear();

        Integer rows = jdbc.queryForObject("SELECT COUNT(*) FROM password_reset_tokens WHERE user_id = ?",
                Integer.class, userId);
        assertThat(rows).isEqualTo(1);
        PasswordResetCode replaced = codes.findByUserId(userId).orElseThrow();
        assertThat(replaced.matches("999999")).isTrue();
        assertThat(replaced.getAttempts()).isZero();
        assertThat(replaced.getUsedAt()).isNull();
    }

    @Test
    @DisplayName("Ao excluir o usuário, o código é apagado junto (ON DELETE CASCADE)")
    void deletedWithUser() {
        UUID userId = existingUserId();
        codes.save(PasswordResetCode.issue(userId, "123456", Instant.now()));
        flushAndClear();

        jdbc.update("DELETE FROM users WHERE id = ?", userId);

        assertThat(codes.findByUserId(userId)).isEmpty();
    }
}