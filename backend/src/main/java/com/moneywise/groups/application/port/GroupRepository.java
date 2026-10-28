package com.moneywise.groups.application.port;

import java.util.Optional;
import java.util.UUID;

import com.moneywise.groups.domain.Group;

/** Persistência de agregados de grupo. */
public interface GroupRepository {

    Group save(Group group);

    Optional<Group> findById(UUID id);
}
