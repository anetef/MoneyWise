package com.moneywise.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import com.moneywise.shared.money.Money;
import com.moneywise.transactions.domain.Transaction;
import com.moneywise.transactions.domain.TransactionType;

@DisplayName("Segurança: transações são privadas de cada usuário")
class TransactionIsolationSecurityTest extends SecurityTestSupport {

    private static final String B_AMOUNT = "98765.43";

    @Test
    @DisplayName("A não vê as transações de B na listagem")
    void cannotListOtherUsersTransactions() throws Exception {
        UUID a = newUser("Ana");
        UUID b = newUser("Bruno");
        Transaction fromB = newTransaction(b, B_AMOUNT, TransactionType.INCOME);

        String body = mockMvc.perform(get(API + "/transactions").with(asUser(a)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0))
                .andReturn().getResponse().getContentAsString();

        assertThat(body).doesNotContain(fromB.getId().toString()).doesNotContain(B_AMOUNT);
    }

    @Test
    @DisplayName("A não vê as transações de B no relatório mensal")
    void cannotSeeOtherUsersTransactionsInMonthlyReport() throws Exception {
        UUID a = newUser("Ana");
        UUID b = newUser("Bruno");
        newTransaction(b, B_AMOUNT, TransactionType.INCOME);

        String body = mockMvc.perform(get(API + "/reports/monthly").with(asUser(a))
                        .param("month", YearMonth.now().toString()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertThat(body).doesNotContain(B_AMOUNT);
    }

    @Test
    @DisplayName("A não edita a transação de B: 404 e a transação continua igual")
    void cannotUpdateOtherUsersTransaction() throws Exception {
        UUID a = newUser("Ana");
        UUID b = newUser("Bruno");
        Transaction fromB = newTransaction(b, B_AMOUNT, TransactionType.INCOME);

        String body = """
                {"amount":1.00,"date":"%s","category":"Outros","type":"EXPENSE",
                 "description":"invasão","updatedAt":"%s"}
                """.formatted(LocalDate.now(), fromB.getUpdatedAt());
        mockMvc.perform(put(API + "/transactions/" + fromB.getId()).with(asUser(a))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isNotFound());

        Transaction stillThere = transactions.findByIdAndUserId(fromB.getId(), b).orElseThrow();
        assertThat(stillThere.getAmount()).isEqualTo(Money.of(B_AMOUNT, "BRL"));
    }

    @Test
    @DisplayName("A não exclui a transação de B: 404 e a transação continua lá")
    void cannotDeleteOtherUsersTransaction() throws Exception {
        UUID a = newUser("Ana");
        UUID b = newUser("Bruno");
        Transaction fromB = newTransaction(b, B_AMOUNT, TransactionType.INCOME);

        mockMvc.perform(delete(API + "/transactions/" + fromB.getId()).with(asUser(a)))
                .andExpect(status().isNotFound());

        assertThat(transactions.findByIdAndUserId(fromB.getId(), b)).isPresent();
    }

    @Test
    @DisplayName("A não sobrescreve a transação de B criando outra com o mesmo id: 404")
    void cannotReuseOtherUsersTransactionId() throws Exception {
        UUID a = newUser("Ana");
        UUID b = newUser("Bruno");
        Transaction fromB = newTransaction(b, B_AMOUNT, TransactionType.INCOME);

        String body = """
                {"id":"%s","amount":1.00,"date":"%s","category":"Outros","type":"EXPENSE"}
                """.formatted(fromB.getId(), LocalDate.now());
        mockMvc.perform(post(API + "/transactions").with(asUser(a))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isNotFound());

        assertThat(transactions.findByIdAndUserId(fromB.getId(), b).orElseThrow().getAmount())
                .isEqualTo(Money.of(B_AMOUNT, "BRL"));
    }
}