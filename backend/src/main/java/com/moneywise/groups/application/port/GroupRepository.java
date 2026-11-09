package com.moneywise.groups.application.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.groups.domain.Group;

/** Persistência de agregados de grupo. */
public interface GroupRepository {

    Group save(Group group);

    Optional<Group> findById(UUID id);

    /** Grupos dos quais o usuário participa, do mais antigo para o mais recente. */
    List<Group> findAllByMemberId(UUID userId);
}
