package com.moneywise.transactions.presentation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Currency;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.jayway.jsonpath.JsonPath;
import com.moneywise.TestcontainersConfiguration;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;
import com.moneywise.shared.money.Money;
import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.Transaction;
import com.moneywise.transactions.domain.TransactionType;

import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class TransactionControllerIntegrationTest {

    private static final String TRANSACTIONS_URL = "/api/v1/transactions";

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository users;

    @Autowired
    private TransactionRepository transactions;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    @DisplayName("Cria transação e usa a moeda do perfil do usuário autenticado")
    void createsTransactionWithProfileCurrency() throws Exception {
        UUID userId = newUser("USD");
        UUID id = UUID.randomUUID();

        String response = create(userId, id, currentDate(), "15.75")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.updatedAt").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        assertThat(JsonPath.read(response, "$.amount").toString()).isEqualTo("15.75");
        assertThat(transactions.findByIdAndUserId(id, userId)).isPresent();
    }

    @Test
    @DisplayName("Repetir a criação com o mesmo ID do usuário não duplica nem sobrescreve")
    void retriesCreateIdempotently() throws Exception {
        UUID userId = newUser("BRL");
        UUID id = UUID.randomUUID();
        LocalDate date = currentDate();

        create(userId, id, date, "10.00").andExpect(status().isCreated());
        create(userId, id, date, "99.00")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(10.00));

        assertThat(transactions.findByUserIdAndFilters(userId, null, null, null))
                .extracting(Transaction::getId).containsExactly(id);
    }

    @Test
    @DisplayName("Não permite que outro usuário crie uma transação usando o ID existente")
    void rejectsDuplicateIdFromAnotherUser() throws Exception {
        UUID ownerId = newUser("BRL");
        UUID otherId = newUser("BRL");
        UUID id = UUID.randomUUID();
        create(ownerId, id, currentDate(), "10.00").andExpect(status().isCreated());

        create(otherId, id, currentDate(), "50.00")
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));

        assertThat(transactions.findByIdAndUserId(id, ownerId)).isPresent();
        assertThat(transactions.findByIdAndUserId(id, otherId)).isEmpty();
    }

    @Test
    @DisplayName("Rejeita a criação em mês fechado com erro de regra de negócio")
    void rejectsCreateInClosedMonth() throws Exception {
        UUID userId = newUser("BRL");
        LocalDate closedMonthDate = YearMonth.now().minusMonths(1).atEndOfMonth();

        create(userId, UUID.randomUUID(), closedMonthDate, "10.00")
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("TRANSACTION_MONTH_CLOSED"));
    }

    @Test
    @DisplayName("Atualiza transação própria e não deixa uma versão antiga sobrescrever a atual")
    void updatesOwnTransactionAndKeepsLatestVersion() throws Exception {
        UUID userId = newUser("BRL");
        UUID id = UUID.randomUUID();
        LocalDate date = currentDate();
        String created = create(userId, id, date, "10.00")
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String originalUpdatedAt = JsonPath.read(created, "$.updatedAt").toString();

        String updated = update(userId, id, date, "15.00", originalUpdatedAt)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(15.00))
                .andReturn().getResponse().getContentAsString();
        String latestUpdatedAt = JsonPath.read(updated, "$.updatedAt").toString();
        assertThat(latestUpdatedAt).isNotEqualTo(originalUpdatedAt);

        update(userId, id, date, "99.00", originalUpdatedAt)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(15.00))
                .andExpect(jsonPath("$.updatedAt").value(latestUpdatedAt));
    }

    @Test
    @DisplayName("Esconde transação de outro usuário na edição")
    void hidesForeignTransactionOnUpdate() throws Exception {
        UUID ownerId = newUser("BRL");
        UUID otherId = newUser("BRL");
        UUID id = UUID.randomUUID();
        create(ownerId, id, currentDate(), "10.00").andExpect(status().isCreated());

        update(otherId, id, currentDate(), "20.00", "2026-10-25T00:00:00Z")
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Não edita transação de mês fechado")
    void rejectsUpdateInClosedMonth() throws Exception {
        UUID userId = newUser("BRL");
        UUID id = UUID.randomUUID();
        Transaction closedTransaction = saveHistoricalTransaction(userId, id);

        update(userId, id, currentDate(), "20.00", closedTransaction.getUpdatedAt().toString())
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("TRANSACTION_MONTH_CLOSED"));
    }

    @Test
    @DisplayName("Exclui transação própria e responde 204")
    void deletesOwnTransaction() throws Exception {
        UUID userId = newUser("BRL");
        UUID id = UUID.randomUUID();
        create(userId, id, currentDate(), "10.00").andExpect(status().isCreated());

        mockMvc.perform(delete(TRANSACTIONS_URL + "/" + id).with(asUser(userId)))
                .andExpect(status().isNoContent());

        assertThat(transactions.findByIdAndUserId(id, userId)).isEmpty();
    }

    @Test
    @DisplayName("Esconde transação de outro usuário na exclusão")
    void hidesForeignTransactionOnDelete() throws Exception {
        UUID ownerId = newUser("BRL");
        UUID otherId = newUser("BRL");
        UUID id = UUID.randomUUID();
        create(ownerId, id, currentDate(), "10.00").andExpect(status().isCreated());

        mockMvc.perform(delete(TRANSACTIONS_URL + "/" + id).with(asUser(otherId)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Não exclui transação de mês fechado")
    void rejectsDeleteInClosedMonth() throws Exception {
        UUID userId = newUser("BRL");
        UUID id = UUID.randomUUID();
        saveHistoricalTransaction(userId, id);

        mockMvc.perform(delete(TRANSACTIONS_URL + "/" + id).with(asUser(userId)))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("TRANSACTION_MONTH_CLOSED"));

        assertThat(transactions.findByIdAndUserId(id, userId)).isPresent();
    }

    private UUID newUser(String currency) {
        User user = User.register("Usuário", Email.of("tx03-" + UUID.randomUUID() + "@example.com"),
                "hash-da-senha", Currency.getInstance(currency));
        return users.save(user).getId();
    }

    private Transaction saveHistoricalTransaction(UUID userId, UUID id) {
        LocalDate date = YearMonth.now().minusMonths(1).atEndOfMonth();
        return transactions.save(Transaction.create(id, userId, Money.of("10.00", "BRL"), date,
                Category.of("Comida"), TransactionType.EXPENSE));
    }

    private ResultActions create(UUID userId, UUID id, LocalDate date, String amount) throws Exception {
        String body = """
                {"id":"%s","amount":%s,"date":"%s","category":"Comida","type":"EXPENSE"}
                """.formatted(id, amount, date);
        return mockMvc.perform(post(TRANSACTIONS_URL).with(asUser(userId))
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private ResultActions update(UUID userId, UUID id, LocalDate date, String amount, String updatedAt)
            throws Exception {
        String body = """
                {"amount":%s,"date":"%s","category":"Compras","type":"INCOME",
                 "description":"Alterada","updatedAt":"%s"}
                """.formatted(amount, date, updatedAt);
        return mockMvc.perform(put(TRANSACTIONS_URL + "/" + id).with(asUser(userId))
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private JwtRequestPostProcessor asUser(UUID userId) {
        return org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt()
                .jwt(jwt -> jwt.subject(userId.toString()));
    }

    private LocalDate currentDate() {
        return LocalDate.now(java.time.Clock.systemUTC());
    }
}
