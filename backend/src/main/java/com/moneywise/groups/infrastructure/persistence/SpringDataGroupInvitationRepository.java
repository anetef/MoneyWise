package com.moneywise.groups.infrastructure.persistence;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.moneywise.groups.domain.GroupInvitationStatus;

/** Consultas JPA de convites de grupo. */
public interface SpringDataGroupInvitationRepository extends Repository<GroupInvitationEntity, UUID> {

    GroupInvitationEntity save(GroupInvitationEntity entity);

    Optional<GroupInvitationEntity> findByCode(String code);

    /** Muda o status somente se ele ainda for o esperado; evita que dois aceites usem o mesmo convite. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            update GroupInvitationEntity i set i.status = :newStatus, i.updatedAt = :now
            where i.id = :id and i.status = :expectedStatus
            """)
    int updateStatusIfCurrent(@Param("id") UUID id, @Param("expectedStatus") GroupInvitationStatus expectedStatus,
            @Param("newStatus") GroupInvitationStatus newStatus, @Param("now") Instant now);
}
