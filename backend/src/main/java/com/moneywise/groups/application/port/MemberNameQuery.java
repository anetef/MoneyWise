package com.moneywise.groups.application.port;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;

/** Consulta somente o nome de exibição dos participantes; nenhum dado financeiro pessoal. */
public interface MemberNameQuery {

    /** Devolve o nome de cada usuário encontrado; IDs inexistentes ficam fora do mapa. */
    Map<UUID, String> findNamesByUserIds(Collection<UUID> userIds);
}
