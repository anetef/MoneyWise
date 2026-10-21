package com.moneywise.transactions.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

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
import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.Transaction;
import com.moneywise.transactions.domain.TransactionType;
import com.moneywise.transactions.infrastructure.persistence.SpringDataTransactionRepository;
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
    private SpringDataTransactionRepository springData;

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
        TransactionEntity entity = springData.findById(expected.getId()).orElseThrow();
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
        assertThat(transactionRepository.findByUserIdAndFilters(other.getId(), null, null, null)).isEmpty();
        assertThat(transactionRepository.findByUserIdAndFilters(owner.getId(), null, null, null))
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

        List<Transaction> found = transactionRepository.findByUserIdAndFilters(owner.getId(), "Comida",
                LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 31));

        assertThat(found).extracting(Transaction::getId).containsExactly(match.getId());
    }
}
