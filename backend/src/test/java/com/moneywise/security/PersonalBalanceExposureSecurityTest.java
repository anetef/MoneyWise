package com.moneywise.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.RequestBuilder;

import com.moneywise.goals.application.port.ContributionRepository;
import com.moneywise.goals.domain.ContributionType;
import com.moneywise.goals.domain.Goal;
import com.moneywise.shared.money.Money;
import com.moneywise.transactions.domain.TransactionType;

@DisplayName("Segurança: nenhum endpoint expõe o saldo pessoal de outro usuário")
class PersonalBalanceExposureSecurityTest extends SecurityTestSupport {

    private static final String B_INCOME = "98765.43";
    private static final String B_EXPENSE = "12345.67";
    private static final String B_BALANCE = "86419.76";
    private static final String B_CONTRIBUTION = "250.00";

    @Autowired private ContributionRepository contributions;

    @Test
    @DisplayName("Ana, do mesmo grupo de Bruno, não encontra os valores pessoais dele em nenhum endpoint")
    void noEndpointExposesAnotherUsersPersonalMoney() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID groupId = newGroup(ana, bruno);
        UUID goalId = newGoal(groupId);

        newTransaction(bruno, B_INCOME, TransactionType.INCOME);
        newTransaction(bruno, B_EXPENSE, TransactionType.EXPENSE);
        Goal goal = goals.findById(goalId).orElseThrow();
        contributions.save(goal.registerContribution(UUID.randomUUID(), bruno, ContributionType.ENTRADA,
                Money.of(B_CONTRIBUTION, "BRL"), contributions.balanceOf(goal), Instant.now()));

        Map<String, RequestBuilder> endpoints = new LinkedHashMap<>();
        endpoints.put("GET /groups", get(API + "/groups").with(asUser(ana)));
        endpoints.put("GET /groups/{id}", get(API + "/groups/" + groupId).with(asUser(ana)));
        endpoints.put("GET /goals", get(API + "/goals").with(asUser(ana)));
        endpoints.put("GET /goals?groupId", get(API + "/goals").param("groupId", groupId.toString())
                .with(asUser(ana)));
        endpoints.put("GET /goals/{id}", get(API + "/goals/" + goalId).with(asUser(ana)));
        endpoints.put("GET /goals/{id}/thermometer", get(API + "/goals/" + goalId + "/thermometer")
                .with(asUser(ana)));
        endpoints.put("GET /goals/{id}/contributions", get(API + "/goals/" + goalId + "/contributions")
                .with(asUser(ana)));
        endpoints.put("GET /transactions", get(API + "/transactions").with(asUser(ana)));
        endpoints.put("GET /reports/monthly", get(API + "/reports/monthly")
                .param("month", YearMonth.now().toString()).with(asUser(ana)));

        for (Map.Entry<String, RequestBuilder> endpoint : endpoints.entrySet()) {
            String body = mockMvc.perform(endpoint.getValue())
                    .andExpect(status().isOk())
                    .andReturn().getResponse().getContentAsString();

            assertThat(body)
                    .as("Resposta de %s", endpoint.getKey())
                    .doesNotContain(B_INCOME)
                    .doesNotContain(B_EXPENSE)
                    .doesNotContain(B_BALANCE);
        }

        // Controle: o que é da Caixinha aparece; ou seja, as respostas tinham dados de verdade.
        String thermometer = mockMvc.perform(get(API + "/goals/" + goalId + "/thermometer").with(asUser(ana)))
                .andReturn().getResponse().getContentAsString();
        assertThat(thermometer).contains("250");
    }

    @Test
    @DisplayName("A resposta de um aporte (o Termômetro) também não traz o saldo pessoal de ninguém")
    void contributionResponseDoesNotExposePersonalMoney() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID goalId = newGoal(newGroup(ana, bruno));
        newTransaction(bruno, B_INCOME, TransactionType.INCOME);
        newTransaction(bruno, B_EXPENSE, TransactionType.EXPENSE);

        String body = mockMvc.perform(post(API + "/goals/" + goalId + "/contributions").with(asUser(ana))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"id":"%s","type":"ENTRADA","amount":10.00}
                                """.formatted(UUID.randomUUID())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        assertThat(body).doesNotContain(B_INCOME).doesNotContain(B_EXPENSE).doesNotContain(B_BALANCE);
    }
}