package com.moneywise.groups.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

/** Consultas JPA de grupos. Não expõe buscas sem filtro nem operações desnecessárias. */
public interface SpringDataGroupRepository extends Repository<GroupEntity, UUID> {

    GroupEntity save(GroupEntity entity);

    Optional<GroupEntity> findById(UUID id);

    @Query("""
            select g from GroupEntity g
            where g.id in (select m.groupId from GroupMemberEntity m where m.userId = :userId)
            order by g.createdAt asc, g.id asc
            """)
    List<GroupEntity> findAllByMemberUserId(@Param("userId") UUID userId);
}
