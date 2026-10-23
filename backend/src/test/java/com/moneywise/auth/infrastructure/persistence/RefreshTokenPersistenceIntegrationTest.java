package com.moneywise.auth.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Currency;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import com.moneywise.TestcontainersConfiguration;
import com.moneywise.auth.application.port.TokenService;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;
import com.moneywise.auth.infrastructure.persistence.refreshtoken.SpringDataRefreshTokenRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceException;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class RefreshTokenPersistenceIntegrationTest {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SpringDataRefreshTokenRepository refreshTokens;

    @Autowired
    private EntityManager entityManager;

    /** Cria um usuário no banco, porque o refresh token exige um user_id que exista (foreign key). */
    private UUID existingUserId() {
        User user = User.register("Maria", Email.of("maria@gmail.com"), "hash-da-senha", Currency.getInstance("BRL"));
        userRepository.save(user);
        return user.getId();
    }

    /** Grava no banco e limpa a memória do Hibernate, para a próxima leitura ir ao PostgreSQL. */
    private void flushAndClear() {
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("Grava o refresh token no banco só como hash e o valida")
    void shouldPersistOnlyTheHashAndValidate() {
        UUID userId = existingUserId();

        String refreshToken = tokenService.issueRefreshToken(userId);
        flushAndClear();

        assertThat(refreshTokens.findAll())
                .singleElement()
                .satisfies(saved -> {
                    assertThat(saved.getUserId()).isEqualTo(userId);
                    assertThat(saved.getTokenHash()).isNotEqualTo(refreshToken).hasSize(64);
                    assertThat(saved.getRevokedAt()).isNull();
                    assertThat(saved.getExpiresAt()).isNotNull();
                });
        assertThat(tokenService.validateRefreshToken(refreshToken)).hasValue(userId);
    }

    @Test
    @DisplayName("A revogação é gravada no banco")
    void shouldPersistRevocation() {
        UUID userId = existingUserId();
        String refreshToken = tokenService.issueRefreshToken(userId);
        flushAndClear();

        tokenService.revokeRefreshToken(refreshToken);
        flushAndClear();

        assertThat(refreshTokens.findAll())
                .singleElement()
                .satisfies(saved -> assertThat(saved.getRevokedAt()).isNotNull());
        assertThat(tokenService.validateRefreshToken(refreshToken)).isEmpty();
    }

    @Test
    @DisplayName("Rotação com o banco: o antigo fica revogado e o novo vale")
    void shouldRotateWithDatabase() {
        UUID userId = existingUserId();
        String oldToken = tokenService.issueRefreshToken(userId);
        flushAndClear();

        UUID owner = tokenService.validateRefreshToken(oldToken).orElseThrow();
        tokenService.revokeRefreshToken(oldToken);
        String newToken = tokenService.issueRefreshToken(owner);
        flushAndClear();

        assertThat(refreshTokens.findAll()).hasSize(2);
        assertThat(tokenService.validateRefreshToken(oldToken)).isEmpty();
        assertThat(tokenService.validateRefreshToken(newToken)).hasValue(userId);
    }

    @Test
    @DisplayName("O banco recusa refresh token de um usuário que não existe (foreign key)")
    void shouldRejectTokenForUnknownUser() {
        tokenService.issueRefreshToken(UUID.randomUUID());

        assertThatThrownBy(() -> entityManager.flush())
                .isInstanceOf(PersistenceException.class);
    }
}