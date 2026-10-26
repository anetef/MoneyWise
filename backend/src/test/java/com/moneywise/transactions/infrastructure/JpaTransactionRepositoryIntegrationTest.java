package com.moneywise.transactions.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.Currency;
import java.util.List;
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
import com.moneywise.shared.exception.ResourceNotFoundException;
import com.moneywise.shared.money.Money;
import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.Transaction;
import com.moneywise.transactions.domain.TransactionType;
import com.moneywise.transactions.infrastructure.persistence.TransactionEntity;

import jakarta.persistence.EntityManager;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class JpaTransactionRepositoryIntegrationTest {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    private User newUser(String email, String currency) {
        return User.register("Usuário", Email.of(email), "hash-da-senha", Currency.getInstance(currency));
    }

    private Transaction newTransaction(UUID userId, String amount, String category, LocalDate date) {
        return Transaction.create(UUID.randomUUID(), userId, com.moneywise.shared.money.Money.of(amount, "BRL"),
                date, Category.of(category), TransactionType.EXPENSE);
    }

    @Test
    @DisplayName("Persiste e reconstrói transações usando a moeda do perfil")
    void savesAndFindsTransactionForOwner() {
        User owner = userRepository.save(newUser("transacao-owner@example.com", "BRL"));
        Transaction expected = newTransaction(owner.getId(), "25.50", "Comida", LocalDate.of(2026, 10, 10));
        transactionRepository.save(expected);

        Transaction actual = transactionRepository.findByIdAndUserId(expected.getId(), owner.getId()).orElseThrow();

        assertThat(actual.getId()).isEqualTo(expected.getId());
        assertThat(actual.getAmount()).isEqualTo(expected.getAmount());
        assertThat(actual.getAmount().currency()).isEqualTo(Currency.getInstance("BRL"));
        assertThat(actual.getCategory()).isEqualTo(Category.of("Comida"));
        assertThat(actual.getDescription()).isNull();

        entityManager.clear();
        TransactionEntity entity = entityManager.find(TransactionEntity.class, expected.getId());
        assertThat(entity.getCreatedAt()).isNotNull();
        assertThat(entity.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Persiste e recupera descrição opcional")
    void savesAndFindsDescription() {
        User owner = userRepository.save(newUser("transacao-description@example.com", "BRL"));
        Transaction transaction = Transaction.create(UUID.randomUUID(), owner.getId(),
                com.moneywise.shared.money.Money.of("18.00", "BRL"), LocalDate.of(2026, 10, 10),
                Category.of("Comida"), TransactionType.EXPENSE, "Almoço");
        transactionRepository.save(transaction);

        Transaction found = transactionRepository.findByIdAndUserId(transaction.getId(), owner.getId()).orElseThrow();

        assertThat(found.getDescription()).isEqualTo("Almoço");
    }

    @Test
    @DisplayName("Não expõe transação de um usuário para outro")
    void neverReturnsAnotherUsersTransactions() {
        User owner = userRepository.save(newUser("transacao-a@example.com", "BRL"));
        User other = userRepository.save(newUser("transacao-b@example.com", "BRL"));
        Transaction privateTransaction = newTransaction(owner.getId(), "14.00", "Transporte",
                LocalDate.of(2026, 10, 12));
        transactionRepository.save(privateTransaction);

        assertThat(transactionRepository.findByIdAndUserId(privateTransaction.getId(), other.getId())).isEmpty();
        assertThat(transactionRepository.findPageByUserIdAndFilters(other.getId(), null, null, null, 0, 20)
                .content()).isEmpty();
        assertThat(transactionRepository.findPageByUserIdAndFilters(owner.getId(), null, null, null, 0, 20)
                .content())
                .extracting(Transaction::getId).containsExactly(privateTransaction.getId());
    }

    @Test
    @DisplayName("Filtra transações do usuário por categoria e período")
    void filtersByCategoryAndDateRange() {
        User owner = userRepository.save(newUser("transacao-filtros@example.com", "BRL"));
        Transaction match = newTransaction(owner.getId(), "10.00", "Comida", LocalDate.of(2026, 10, 10));
        transactionRepository.save(match);
        transactionRepository.save(newTransaction(owner.getId(), "20.00", "Casa", LocalDate.of(2026, 10, 11)));
        transactionRepository.save(newTransaction(owner.getId(), "30.00", "Comida", LocalDate.of(2026, 9, 30)));

        List<Transaction> found = transactionRepository.findPageByUserIdAndFilters(owner.getId(),
                Category.of(" Comida "), LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 31), 0, 20).content();

        assertThat(found).extracting(Transaction::getId).containsExactly(match.getId());
    }

    @Test
    @DisplayName("Recusa que outro usuário sobrescreva uma transação pelo mesmo id")
    void shouldNotAllowAnotherUserToOverwriteTransactionById() {
        User owner = userRepository.save(newUser("transacao-proprietario@example.com", "BRL"));
        User attacker = userRepository.save(newUser("transacao-outro-usuario@example.com", "BRL"));
        Transaction original = newTransaction(owner.getId(), "25.50", "Comida", LocalDate.of(2026, 10, 10));
        transactionRepository.save(original);
        entityManager.flush();

        Transaction attemptToOverwrite = Transaction.create(original.getId(), attacker.getId(),
                Money.of("999.99", "BRL"), LocalDate.of(2026, 10, 15), Category.of("Compras"),
                TransactionType.INCOME, "Tentativa de sobrescrita");

        assertThatThrownBy(() -> transactionRepository.save(attemptToOverwrite))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasFieldOrPropertyWithValue("code", ResourceNotFoundException.DEFAULT_CODE);

        entityManager.clear();
        Transaction unchanged = transactionRepository.findByIdAndUserId(original.getId(), owner.getId()).orElseThrow();
        assertThat(unchanged.getUserId()).isEqualTo(owner.getId());
        assertThat(unchanged.getAmount()).isEqualTo(Money.of("25.50", "BRL"));
        assertThat(unchanged.getDate()).isEqualTo(LocalDate.of(2026, 10, 10));
        assertThat(unchanged.getCategory()).isEqualTo(Category.of("Comida"));
        assertThat(unchanged.getType()).isEqualTo(TransactionType.EXPENSE);
        assertThat(unchanged.getDescription()).isNull();
    }
}
