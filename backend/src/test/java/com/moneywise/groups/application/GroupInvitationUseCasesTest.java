package com.moneywise.groups.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.moneywise.groups.application.port.InvitationCodeGenerator;
import com.moneywise.groups.application.usecase.GroupView;
import com.moneywise.groups.application.usecase.invitations.AcceptGroupInvitation;
import com.moneywise.groups.application.usecase.invitations.CreateGroupInvitation;
import com.moneywise.groups.application.usecase.invitations.GetInvitationPreview;
import com.moneywise.groups.application.usecase.invitations.InvitationPreview;
import com.moneywise.groups.domain.Group;
import com.moneywise.groups.domain.GroupInvitation;
import com.moneywise.groups.domain.GroupInvitationStatus;
import com.moneywise.groups.domain.Role;
import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ForbiddenOperationException;
import com.moneywise.shared.exception.ResourceNotFoundException;

class GroupInvitationUseCasesTest {

    private static final Instant NOW = Instant.parse("2026-11-07T15:00:00Z");

    private final InMemoryGroupStore store = new InMemoryGroupStore();
    private final AtomicInteger sequence = new AtomicInteger();
    private final InvitationCodeGenerator codes = () -> "CODE" + sequence.incrementAndGet();

    private UUID ana;
    private UUID bruno;
    private UUID carla;
    private Group group;

    @BeforeEach
    void setUp() {
        ana = store.newUser("Ana");
        bruno = store.newUser("Bruno");
        carla = store.newUser("Carla");
        group = store.save(Group.create(UUID.randomUUID(), "Casa", ana, NOW.minusSeconds(60))
                .addMember(bruno, NOW.minusSeconds(30)));
    }

    @Test
    @DisplayName("Admin gera convite pendente válido por 7 dias")
    void adminCreatesInvitation() {
        GroupInvitation invitation = createAt(NOW).execute(group.getId(), ana);

        assertThat(invitation.getCode()).isEqualTo("CODE1");
        assertThat(invitation.getGroupId()).isEqualTo(group.getId());
        assertThat(invitation.getInvitedBy()).isEqualTo(ana);
        assertThat(invitation.getStatus()).isEqualTo(GroupInvitationStatus.PENDING);
        assertThat(invitation.getExpiresAt()).isEqualTo(NOW.plus(Duration.ofDays(7)));
    }

    @Test
    @DisplayName("Membro comum recebe 403 e quem não participa recebe 404 ao convidar")
    void onlyAdminOfTheGroupInvites() {
        assertThatThrownBy(() -> createAt(NOW).execute(group.getId(), bruno))
                .isInstanceOf(ForbiddenOperationException.class);
        assertThatThrownBy(() -> createAt(NOW).execute(group.getId(), carla))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThat(store.invitations).isEmpty();
    }

    @Test
    @DisplayName("Prévia mostra nome do grupo, quem convidou, nº de membros e validade")
    void previewShowsSafeSummary() {
        GroupInvitation invitation = createAt(NOW).execute(group.getId(), ana);

        InvitationPreview preview = previewAt(NOW.plusSeconds(5)).execute(invitation.getCode(), carla);

        assertThat(preview.groupName()).isEqualTo("Casa");
        assertThat(preview.invitedByName()).isEqualTo("Ana");
        assertThat(preview.memberCount()).isEqualTo(2);
        assertThat(preview.expiresAt()).isEqualTo(invitation.getExpiresAt());
        assertThat(preview.alreadyMember()).isFalse();
        assertThat(previewAt(NOW).execute(invitation.getCode(), bruno).alreadyMember()).isTrue();
        assertThatThrownBy(() -> previewAt(NOW).execute("NAO-EXISTE", carla))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Aceite inclui o usuário como membro comum e consome o convite")
    void acceptAddsMemberOnce() {
        GroupInvitation invitation = createAt(NOW).execute(group.getId(), ana);

        GroupView view = acceptAt(NOW.plusSeconds(10)).execute(invitation.getCode(), carla);

        assertThat(view.group().findMember(carla)).hasValueSatisfying(member -> {
            assertThat(member.role()).isEqualTo(Role.MEMBER);
            assertThat(member.joinedAt()).isEqualTo(NOW.plusSeconds(10));
        });
        assertThat(view.nameOf(carla)).isEqualTo("Carla");
        assertThat(store.invitations.get(invitation.getCode()).getStatus())
                .isEqualTo(GroupInvitationStatus.ACCEPTED);

        UUID diego = store.newUser("Diego");
        assertThatThrownBy(() -> acceptAt(NOW.plusSeconds(20)).execute(invitation.getCode(), diego))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", "GROUP_INVITATION_NOT_PENDING");
    }

    @Test
    @DisplayName("Quem já é membro recebe o grupo, sem duplicar, e o convite segue pendente")
    void alreadyMemberDoesNotConsumeInvitation() {
        GroupInvitation invitation = createAt(NOW).execute(group.getId(), ana);

        GroupView view = acceptAt(NOW.plusSeconds(10)).execute(invitation.getCode(), bruno);

        assertThat(view.group().getMembers()).hasSize(2);
        assertThat(store.invitations.get(invitation.getCode()).getStatus())
                .isEqualTo(GroupInvitationStatus.PENDING);
    }

    @Test
    @DisplayName("Convite com 7 dias ou mais é recusado na prévia e no aceite")
    void expiredInvitationIsRejected() {
        GroupInvitation invitation = createAt(NOW).execute(group.getId(), ana);
        Instant expired = NOW.plus(Duration.ofDays(7));

        assertThatThrownBy(() -> previewAt(expired).execute(invitation.getCode(), carla))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", "GROUP_INVITATION_EXPIRED");
        assertThatThrownBy(() -> acceptAt(expired).execute(invitation.getCode(), carla))
                .isInstanceOf(BusinessRuleException.class)
                .hasFieldOrPropertyWithValue("code", "GROUP_INVITATION_EXPIRED");
        assertThat(store.groups.get(group.getId()).isMember(carla)).isFalse();
    }

    private CreateGroupInvitation createAt(Instant instant) {
        return new CreateGroupInvitation(store, store, codes, Clock.fixed(instant, ZoneOffset.UTC));
    }

    private GetInvitationPreview previewAt(Instant instant) {
        return new GetInvitationPreview(store, store, store, Clock.fixed(instant, ZoneOffset.UTC));
    }

    private AcceptGroupInvitation acceptAt(Instant instant) {
        return new AcceptGroupInvitation(store, store, store, Clock.fixed(instant, ZoneOffset.UTC));
    }
}
