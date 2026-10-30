package com.moneywise.groups.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.Repository;

/** Consultas JPA de grupos. Não expõe buscas sem filtro nem operações desnecessárias. */
public interface SpringDataGroupRepository extends Repository<GroupEntity, UUID> {

    GroupEntity save(GroupEntity entity);

    Optional<GroupEntity> findById(UUID id);
}
