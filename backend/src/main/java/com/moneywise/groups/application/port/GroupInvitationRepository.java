package com.moneywise.groups.application.port;

import java.util.Optional;
import java.util.UUID;

import com.moneywise.groups.domain.GroupInvitation;
import com.moneywise.groups.domain.GroupMember;

/** Persistência dos convites de grupo (L-05). */
public interface GroupInvitationRepository {

    GroupInvitation save(GroupInvitation invitation);

    Optional<GroupInvitation> findByCode(String code);

    /**
     * Marca o convite como aceito e insere o membro na mesma transação.
     *
     * @return {@code false} quando o convite já não estava pendente (por exemplo, aceito por outra pessoa
     *         ao mesmo tempo); nesse caso nada é gravado.
     */
    boolean acceptAndAddMember(UUID invitationId, UUID groupId, GroupMember member);
}
