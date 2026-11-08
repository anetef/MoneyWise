package com.moneywise.groups.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.groups.application.usecase.GroupView;
import com.moneywise.groups.application.usecase.create.CreateGroup;
import com.moneywise.groups.application.usecase.create.CreateGroupCommand;
import com.moneywise.groups.application.usecase.members.LeaveGroup;
import com.moneywise.groups.application.usecase.members.RemoveGroupMember;
import com.moneywise.groups.application.usecase.query.GetGroup;
import com.moneywise.groups.application.usecase.query.ListGroups;
import com.moneywise.groups.domain.Group;
import com.moneywise.groups.domain.Role;
import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ForbiddenOperationException;
import com.moneywise.shared.exception.ResourceNotFoundException;

class GroupUseCasesTest {

    private static final Instant NOW = Instant.parse("2026-11-07T15:00:00Z");

    private final InMemoryGroupStore store = new InMemoryGroupStore();
    private final Clock clock = Clock.fixed(NOW, ZoneOffset.UTC);
    private final CreateGroup createGroup = new CreateGroup(store, store, clock);
    private final ListGroups listGroups = new ListGroups(store, store);
    private final GetGroup getGroup = new GetGroup(store, store);
    private final RemoveGroupMember removeMember = new RemoveGroupMember(store);
    private final LeaveGroup leaveGroup = new LeaveGroup(store);

    @Test
    @DisplayName("Cria o grupo com o criador como Admin e o nome dele na resposta")
    void createsGroupWithCreatorAsAdmin() {
        UUID creator = store.newUser("Ana");
        UUID id = UUID.randomUUID();

        GroupView view = createGroup.execute(new CreateGroupCommand(id, creator, "Viagem"));

        assertThat(view.group().getId()).isEqualTo(id);
        assertThat(view.group().getAdminId()).isEqualTo(creator);
        assertThat(view.group().getMembers()).singleElement()
                .satisfies(member -> {
                    assertThat(member.role()).isEqualTo(Role.ADMIN);
                    assertThat(member.joinedAt()).isEqualTo(NOW);
                });
        assertThat(view.nameOf(creator)).isEqualTo("Ana");
    }

    @Test
    @DisplayName("Reenvio do mesmo ID por quem participa não duplica nem altera o grupo")
    void resendingSameIdIsIdempotent() {
        UUID creator = store.newUser("Ana");
        UUID id = UUID.randomUUID();
        createGroup.execute(new CreateGroupCommand(id, creator, "Viagem"));

        GroupView again = createGroup.execute(new CreateGroupCommand(id, creator, "Outro nome"));

        assertThat(again.group().getName()).isEqualTo("Viagem");
        assertThat(store.groups).hasSize(1);
        assertThat(store.groupSaves).isEqualTo(1);
    }

    @Test
    @DisplayName("ID de grupo alheio responde 404 sem revelar nem alterar o grupo")
    void idOfSomeoneElsesGroupIsNotFound() {
        UUID owner = store.newUser("Ana");
        UUID outsider = store.newUser("Bruno");
        UUID id = UUID.randomUUID();
        createGroup.execute(new CreateGroupCommand(id, owner, "Viagem"));

        assertThatThrownBy(() -> createGroup.execute(new CreateGroupCommand(id, outsider, "Invasão")))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThat(store.groups.get(id).isMember(outsider)).isFalse();
    }

    @Test
    @DisplayName("Usuário inexistente não cria grupo")
    void unknownUserCannotCreate() {
        assertThatThrownBy(() -> createGroup.execute(
                new CreateGroupCommand(UUID.randomUUID(), UUID.randomUUID(), "Viagem")))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThat(store.groups).isEmpty();
    }

    @Test
    @DisplayName("Lista e detalha só os grupos de que o usuário participa")
    void listsAndDetailsOnlyOwnGroups() {
        UUID ana = store.newUser("Ana");
        UUID bruno = store.newUser("Bruno");
        Group shared = store.save(Group.create(UUID.randomUUID(), "Casa", ana, NOW)
                .addMember(bruno, NOW.plusSeconds(1)));
        Group anaOnly = store.save(Group.create(UUID.randomUUID(), "Reserva", ana, NOW.plusSeconds(2)));

        assertThat(listGroups.execute(bruno)).extracting(view -> view.group().getId())
                .containsExactly(shared.getId());
        assertThat(listGroups.execute(ana)).extracting(view -> view.group().getId())
                .containsExactly(shared.getId(), anaOnly.getId());
        assertThat(listGroups.execute(bruno).getFirst().nameOf(ana)).isEqualTo("Ana");

        assertThat(getGroup.execute(shared.getId(), bruno).group().getName()).isEqualTo("Casa");
        assertThatThrownBy(() -> getGroup.execute(anaOnly.getId(), bruno))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Admin remove membro; membro comum recebe 403 e quem não participa recebe 404")
    void removesMemberOnlyAsAdmin() {
        UUID ana = store.newUser("Ana");
        UUID bruno = store.newUser("Bruno");
        UUID carla = store.newUser("Carla");
        Group group = store.save(Group.create(UUID.randomUUID(), "Casa", ana, NOW)
                .addMember(bruno, NOW.plusSeconds(1))
                .addMember(carla, NOW.plusSeconds(2)));

        assertThatThrownBy(() -> removeMember.execute(group.getId(), bruno, carla))
                .isInstanceOf(ForbiddenOperationException.class);
        assertThatThrownBy(() -> removeMember.execute(group.getId(), UUID.randomUUID(), carla))
                .isInstanceOf(ResourceNotFoundException.class);

        removeMember.execute(group.getId(), ana, carla);

        assertThat(store.groups.get(group.getId()).isMember(carla)).isFalse();
        assertThatThrownBy(() -> getGroup.execute(group.getId(), carla))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Admin que se remove ou sai passa o papel ao membro mais antigo (L-10)")
    void adminLeavingPromotesOldest() {
        UUID ana = store.newUser("Ana");
        UUID bruno = store.newUser("Bruno");
        UUID carla = store.newUser("Carla");
        Group removal = store.save(Group.create(UUID.randomUUID(), "Remoção", ana, NOW)
                .addMember(carla, NOW.plusSeconds(20))
                .addMember(bruno, NOW.plusSeconds(10)));
        Group leaving = store.save(Group.create(UUID.randomUUID(), "Saída", ana, NOW)
                .addMember(carla, NOW.plusSeconds(20))
                .addMember(bruno, NOW.plusSeconds(10)));

        removeMember.execute(removal.getId(), ana, ana);
        leaveGroup.execute(leaving.getId(), ana);

        assertThat(store.groups.get(removal.getId()).getAdminId()).isEqualTo(bruno);
        assertThat(store.groups.get(leaving.getId()).getAdminId()).isEqualTo(bruno);
        assertThat(store.groups.get(leaving.getId()).isMember(ana)).isFalse();
    }

    @Test
    @DisplayName("Membro sai; único membro não sai e quem não participa recebe 404")
    void leaveRules() {
        UUID ana = store.newUser("Ana");
        UUID bruno = store.newUser("Bruno");
        Group shared = store.save(Group.create(UUID.randomUUID(), "Casa", ana, NOW)
                .addMember(bruno, NOW.plusSeconds(1)));
        Group individual = store.save(Group.create(UUID.randomUUID(), "Individual", ana, NOW));

        leaveGroup.execute(shared.getId(), bruno);

        assertThat(store.groups.get(shared.getId()).isMember(bruno)).isFalse();
        assertThatThrownBy(() -> leaveGroup.execute(individual.getId(), ana))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", "GROUP_LAST_MEMBER_CANNOT_LEAVE");
        assertThatThrownBy(() -> leaveGroup.execute(shared.getId(), bruno))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
