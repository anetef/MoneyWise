package com.moneywise.auth.infra.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Currency;
import java.util.UUID;

import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.infrastructure.UserEntity;
import com.moneywise.auth.infrastructure.SpringDataUserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import com.moneywise.TestcontainersConfiguration;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceException;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class JpaUserRepositoryIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SpringDataUserRepository springData;

    @Autowired
    private EntityManager entityManager;

    private static final Currency BRL = Currency.getInstance("BRL");

    private User newUser(String email) {
        return User.register("Maria", Email.of(email), "hash-da-senha", BRL);
    }

    /** Grava no banco e esvazia a memória do Hibernate, para a próxima leitura ir de fato ao PostgreSQL. */
    private void flushAndClear() {
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("Salva um usuário e o encontra pelo id, com todos os dados")
    void shouldSaveAndFindById() {
        User user = newUser("maria@gmail.com");

        userRepository.save(user);
        flushAndClear();

        User found = userRepository.findById(user.getId()).orElseThrow();
        assertThat(found).isEqualTo(user);
        assertThat(found.getName()).isEqualTo("Maria");
        assertThat(found.getEmail()).isEqualTo(Email.of("maria@gmail.com"));
        assertThat(found.getPasswordHash()).isEqualTo("hash-da-senha");
        assertThat(found.getCurrency()).isEqualTo(BRL);
    }

    @Test
    @DisplayName("Encontra um usuário pelo e-mail")
    void shouldFindByEmail() {
        User user = newUser("maria@gmail.com");
        userRepository.save(user);
        flushAndClear();

        assertThat(userRepository.findByEmail(Email.of("Maria@Gmail.com")))
                .hasValue(user);
    }

    @Test
    @DisplayName("Informa se o e-mail já está cadastrado")
    void shouldCheckIfEmailExists() {
        userRepository.save(newUser("maria@gmail.com"));
        flushAndClear();

        assertThat(userRepository.existsByEmail(Email.of("maria@gmail.com"))).isTrue();
        assertThat(userRepository.existsByEmail(Email.of("joao@gmail.com"))).isFalse();
    }

    @Test
    @DisplayName("Retorna vazio para um id que não existe")
    void shouldReturnEmptyForUnknownId() {
        assertThat(userRepository.findById(UUID.randomUUID())).isEmpty();
    }

    @Test
    @DisplayName("Preenche created_at e updated_at ao salvar")
    void shouldFillAuditColumns() {
        User user = newUser("maria@gmail.com");
        userRepository.save(user);
        flushAndClear();

        UserEntity entity = springData.findById(user.getId()).orElseThrow();
        assertThat(entity.getCreatedAt()).isNotNull();
        assertThat(entity.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("O banco recusa dois usuários com o mesmo e-mail (RN06)")
    void shouldRejectDuplicateEmail() {
        userRepository.save(newUser("maria@gmail.com"));
        userRepository.save(newUser("maria@gmail.com"));

        assertThatThrownBy(() -> entityManager.flush())
                .isInstanceOf(PersistenceException.class);
    }
}