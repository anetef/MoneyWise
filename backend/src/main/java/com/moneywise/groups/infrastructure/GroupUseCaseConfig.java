package com.moneywise.groups.infrastructure;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.moneywise.groups.application.GroupAuthorizationService;
import com.moneywise.groups.application.port.GroupInvitationRepository;
import com.moneywise.groups.application.port.GroupMemberRepository;
import com.moneywise.groups.application.port.GroupRepository;
import com.moneywise.groups.application.port.InvitationCodeGenerator;
import com.moneywise.groups.application.port.MemberNameQuery;
import com.moneywise.groups.application.usecase.create.CreateGroup;
import com.moneywise.groups.application.usecase.invitations.AcceptGroupInvitation;
import com.moneywise.groups.application.usecase.invitations.CreateGroupInvitation;
import com.moneywise.groups.application.usecase.invitations.GetInvitationPreview;
import com.moneywise.groups.application.usecase.members.LeaveGroup;
import com.moneywise.groups.application.usecase.members.RemoveGroupMember;
import com.moneywise.groups.application.usecase.query.GetGroup;
import com.moneywise.groups.application.usecase.query.ListGroups;

/** Liga a autorização e os casos de uso de grupos aos ports e ao relógio UTC padrão. */
@Configuration
public class GroupUseCaseConfig {

    @Bean
    GroupAuthorizationService groupAuthorizationService(GroupMemberRepository members) {
        return new GroupAuthorizationService(members);
    }

    @Bean
    CreateGroup createGroup(GroupRepository groups, MemberNameQuery names, Clock clock) {
        return new CreateGroup(groups, names, clock);
    }

    @Bean
    ListGroups listGroups(GroupRepository groups, MemberNameQuery names) {
        return new ListGroups(groups, names);
    }

    @Bean
    GetGroup getGroup(GroupRepository groups, MemberNameQuery names) {
        return new GetGroup(groups, names);
    }

    @Bean
    RemoveGroupMember removeGroupMember(GroupRepository groups) {
        return new RemoveGroupMember(groups);
    }

    @Bean
    LeaveGroup leaveGroup(GroupRepository groups) {
        return new LeaveGroup(groups);
    }

    @Bean
    CreateGroupInvitation createGroupInvitation(GroupRepository groups, GroupInvitationRepository invitations,
            InvitationCodeGenerator codes, Clock clock) {
        return new CreateGroupInvitation(groups, invitations, codes, clock);
    }

    @Bean
    GetInvitationPreview getInvitationPreview(GroupInvitationRepository invitations, GroupRepository groups,
            MemberNameQuery names, Clock clock) {
        return new GetInvitationPreview(invitations, groups, names, clock);
    }

    @Bean
    AcceptGroupInvitation acceptGroupInvitation(GroupInvitationRepository invitations, GroupRepository groups,
            MemberNameQuery names, Clock clock) {
        return new AcceptGroupInvitation(invitations, groups, names, clock);
    }
}
