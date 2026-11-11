package com.moneywise.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.RequestBuilder;

import com.moneywise.goals.application.port.ContributionRepository;
import com.moneywise.goals.domain.ContributionType;
import com.moneywise.goals.domain.Goal;
import com.moneywise.shared.money.Money;

import org.springframework.beans.factory.annotation.Autowired;

/**
 * Seção 6.3: quem não é membro do grupo não acessa as metas nem os aportes.
 * A resposta é sempre 404, sem revelar se a meta existe (AD-18).
 */
@DisplayName("Segurança: não membro não acessa metas nem aportes")
class GoalAccessSecurityTest extends SecurityTestSupport {

    @Autowired private ContributionRepository contributions;

    private UUID admin;
    private UUID stranger;
    private UUID groupId;
    private UUID goalId;

    /** Ana é Admin do grupo e tem uma meta com R$ 100 guardados; o Estranho não participa do grupo. */
    private void scenario() {
        admin = newUser("Ana");
        stranger = newUser("Estranho");
        groupId = newGroup(admin);
        goalId = newGoal(groupId);
        Goal goal = goals.findById(goalId).orElseThrow();
        contributions.save(goal.registerContribution(UUID.randomUUID(), admin, ContributionType.ENTRADA,
                Money.of("100.00", "BRL"), contributions.balanceOf(goal), Instant.now()));
    }

    private void expectNotFound(RequestBuilder request) throws Exception {
        mockMvc.perform(request).andExpect(status().isNotFound());
    }

    private String goalBody(String name, String target) {
        return """
                {"name":"%s","targetAmount":%s,"deadline":"%s","icon":null,"category":null,
                 "monthlyReminder":false,"milestonesEnabled":false}
                """.formatted(name, target, LocalDate.now().plusMonths(6));
    }

    @Test
    @DisplayName("Controle: o membro acessa a meta (os 404 abaixo não são endpoint quebrado)")
    void memberCanAccessGoal() throws Exception {
        scenario();

        mockMvc.perform(get(API + "/goals/" + goalId).with(asUser(admin)))
                .andExpect(status().isOk());
        mockMvc.perform(get(API + "/goals/" + goalId + "/thermometer").with(asUser(admin)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Não membro não lê a meta, o Termômetro, o histórico de aportes nem o grupo: 404")
    void strangerCannotReadGoalOrContributions() throws Exception {
        scenario();

        expectNotFound(get(API + "/goals/" + goalId).with(asUser(stranger)));
        expectNotFound(get(API + "/goals/" + goalId + "/thermometer").with(asUser(stranger)));
        expectNotFound(get(API + "/goals/" + goalId + "/contributions").with(asUser(stranger)));
        expectNotFound(get(API + "/goals").param("groupId", groupId.toString()).with(asUser(stranger)));
        expectNotFound(get(API + "/groups/" + groupId).with(asUser(stranger)));
    }

    @Test
    @DisplayName("Não membro não vê a meta na lista de metas dele")
    void strangerDoesNotSeeGoalInOwnList() throws Exception {
        scenario();

        mockMvc.perform(get(API + "/goals").with(asUser(stranger)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("Não membro não registra aporte nem retirada: 404 e o acumulado não muda")
    void strangerCannotContribute() throws Exception {
        scenario();

        for (String type : new String[] { "ENTRADA", "RETIRADA" }) {
            String body = """
                    {"id":"%s","type":"%s","amount":50.00}
                    """.formatted(UUID.randomUUID(), type);
            expectNotFound(post(API + "/goals/" + goalId + "/contributions").with(asUser(stranger))
                    .contentType(MediaType.APPLICATION_JSON).content(body));
        }

        Goal goal = goals.findById(goalId).orElseThrow();
        assertThat(contributions.balanceOf(goal)).isEqualTo(Money.of("100.00", "BRL"));
    }

    @Test
    @DisplayName("Não membro não cria, edita, arquiva nem exclui metas: 404 e nada muda")
    void strangerCannotManageGoals() throws Exception {
        scenario();

        expectNotFound(post(API + "/groups/" + groupId + "/goals").with(asUser(stranger))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"id":"%s","name":"Invasão","targetAmount":1.00,
                         "monthlyReminder":false,"milestonesEnabled":false}
                        """.formatted(UUID.randomUUID())));
        expectNotFound(put(API + "/goals/" + goalId).with(asUser(stranger))
                .contentType(MediaType.APPLICATION_JSON).content(goalBody("Invasão", "1.00")));
        expectNotFound(post(API + "/goals/" + goalId + "/archive").with(asUser(stranger)));
        expectNotFound(post(API + "/goals/" + goalId + "/unarchive").with(asUser(stranger)));
        expectNotFound(delete(API + "/goals/" + goalId).with(asUser(stranger)));

        Goal goal = goals.findById(goalId).orElseThrow();
        assertThat(goal.getName()).isEqualTo("Viagem");
        assertThat(goal.getTarget()).isEqualTo(Money.of("1000.00", "BRL"));
        assertThat(goal.isArchived()).isFalse();
        assertThat(goals.findByGroupId(groupId)).hasSize(1);
    }

    @Test
    @DisplayName("Membro removido do grupo perde o acesso à meta na hora")
    void removedMemberLosesAccess() throws Exception {
        UUID ana = newUser("Ana");
        UUID bruno = newUser("Bruno");
        UUID group = newGroup(ana, bruno);
        UUID goal = newGoal(group);
        mockMvc.perform(get(API + "/goals/" + goal).with(asUser(bruno))).andExpect(status().isOk());

        mockMvc.perform(delete(API + "/groups/" + group + "/members/" + bruno).with(asUser(ana)))
                .andExpect(status().isNoContent());

        expectNotFound(get(API + "/goals/" + goal).with(asUser(bruno)));
        expectNotFound(get(API + "/goals/" + goal + "/thermometer").with(asUser(bruno)));
    }
}