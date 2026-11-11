package com.moneywise.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.RequestBuilder;

import com.moneywise.goals.domain.Goal;
import com.moneywise.shared.money.Money;

/**
 * Seção 6.3 e L-17: membro comum não executa ações de Admin.
 * Ele participa do grupo, então a resposta é 403 GROUP_ADMIN_REQUIRED (e não 404).
 */
@DisplayName("Segurança: membro comum não executa ações de Admin")
class AdminActionsSecurityTest extends SecurityTestSupport {

    private UUID admin;
    private UUID member;
    private UUID otherMember;
    private UUID groupId;
    private UUID goalId;

    /** Ana é Admin; Bruno e Carla são membros comuns; o grupo tem uma meta de R$ 1.000. */
    private void scenario() {
        admin = newUser("Ana");
        member = newUser("Bruno");
        otherMember = newUser("Carla");
        groupId = newGroup(admin, member, otherMember);
        goalId = newGoal(groupId);
    }

    private void expectAdminRequired(RequestBuilder request) throws Exception {
        mockMvc.perform(request)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("GROUP_ADMIN_REQUIRED"));
    }

    private String goalBody(String name, String target) {
        return """
                {"name":"%s","targetAmount":%s,"deadline":"%s","icon":null,"category":null,
                 "monthlyReminder":false,"milestonesEnabled":false}
                """.formatted(name, target, LocalDate.now().plusMonths(6));
    }

    @Test
    @DisplayName("Membro comum não cria meta: 403 e o grupo continua com uma meta só")
    void memberCannotCreateGoal() throws Exception {
        scenario();

        expectAdminRequired(post(API + "/groups/" + groupId + "/goals").with(asUser(member))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"id":"%s","name":"Nova","targetAmount":500.00,
                         "monthlyReminder":false,"milestonesEnabled":false}
                        """.formatted(UUID.randomUUID())));

        assertThat(goals.findByGroupId(groupId)).hasSize(1);
    }

    @Test
    @DisplayName("RN04: membro comum não altera o valor da meta (nem outros campos): 403")
    void memberCannotEditGoal() throws Exception {
        scenario();

        expectAdminRequired(put(API + "/goals/" + goalId).with(asUser(member))
                .contentType(MediaType.APPLICATION_JSON).content(goalBody("Viagem", "1.00")));

        Goal goal = goals.findById(goalId).orElseThrow();
        assertThat(goal.getTarget()).isEqualTo(Money.of("1000.00", "BRL"));
        assertThat(goal.getName()).isEqualTo("Viagem");
    }

    @Test
    @DisplayName("Membro comum não arquiva, não desarquiva e não exclui a meta: 403")
    void memberCannotArchiveOrDeleteGoal() throws Exception {
        scenario();

        expectAdminRequired(post(API + "/goals/" + goalId + "/archive").with(asUser(member)));
        expectAdminRequired(post(API + "/goals/" + goalId + "/unarchive").with(asUser(member)));
        expectAdminRequired(delete(API + "/goals/" + goalId).with(asUser(member)));

        Goal goal = goals.findById(goalId).orElseThrow();
        assertThat(goal.isArchived()).isFalse();
    }

    @Test
    @DisplayName("Membro comum não remove outro membro: 403 e o outro continua no grupo")
    void memberCannotRemoveAnotherMember() throws Exception {
        scenario();

        expectAdminRequired(delete(API + "/groups/" + groupId + "/members/" + otherMember).with(asUser(member)));

        // Carla continua membro: ainda acessa a meta do grupo.
        mockMvc.perform(get(API + "/goals/" + goalId).with(asUser(otherMember))).andExpect(status().isOk());
    }

    @Test
    @DisplayName("Membro comum não gera convite: 403")
    void memberCannotCreateInvitation() throws Exception {
        scenario();

        expectAdminRequired(post(API + "/groups/" + groupId + "/invitations").with(asUser(member)));
    }

    @Test
    @DisplayName("Controle: o Admin faz as mesmas ações (os 403 acima não são endpoint quebrado)")
    void adminCanDoAdminActions() throws Exception {
        scenario();

        mockMvc.perform(put(API + "/goals/" + goalId).with(asUser(admin))
                        .contentType(MediaType.APPLICATION_JSON).content(goalBody("Viagem", "2000.00")))
                .andExpect(status().isOk());
        mockMvc.perform(post(API + "/goals/" + goalId + "/archive").with(asUser(admin)))
                .andExpect(status().isOk());
        mockMvc.perform(post(API + "/groups/" + groupId + "/invitations").with(asUser(admin)))
                .andExpect(status().is2xxSuccessful());
        mockMvc.perform(delete(API + "/groups/" + groupId + "/members/" + otherMember).with(asUser(admin)))
                .andExpect(status().isNoContent());
    }
}