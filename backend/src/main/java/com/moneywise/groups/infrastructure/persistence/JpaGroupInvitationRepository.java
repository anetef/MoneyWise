package com.moneywise.groups.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.moneywise.groups.application.port.GroupInvitationRepository;
import com.moneywise.groups.domain.GroupInvitation;
import com.moneywise.groups.domain.GroupInvitationStatus;
import com.moneywise.groups.domain.GroupMember;

/** Implementa o port de convites usando PostgreSQL/JPA. */
@Repository
public class JpaGroupInvitationRepository implements GroupInvitationRepository {

    private final SpringDataGroupInvitationRepository invitations;
    private final SpringDataGroupMemberRepository members;

    public JpaGroupInvitationRepository(SpringDataGroupInvitationRepository invitations,
            SpringDataGroupMemberRepository members) {
        this.invitations = invitations;
        this.members = members;
    }

    @Override
    @Transactional
    public GroupInvitation save(GroupInvitation invitation) {
        return GroupInvitationMapper.toDomain(invitations.save(GroupInvitationMapper.toEntity(invitation)));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GroupInvitation> findByCode(String code) {
        return invitations.findByCode(code).map(GroupInvitationMapper::toDomain);
    }

    @Override
    @Transactional
    public boolean acceptAndAddMember(UUID invitationId, UUID groupId, GroupMember member) {
        int accepted = invitations.updateStatusIfCurrent(invitationId, GroupInvitationStatus.PENDING,
                GroupInvitationStatus.ACCEPTED, member.joinedAt());
        if (accepted == 0) {
            return false;
        }
        members.insertIfAbsent(groupId, member.userId(), member.role().name(), member.joinedAt());
        return true;
    }
}
