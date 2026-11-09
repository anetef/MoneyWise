package com.moneywise.goals.application.port;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;

public interface ContributorNameQuery {

    Map<UUID, String> findNamesByUserIds(Collection<UUID> userIds);
}