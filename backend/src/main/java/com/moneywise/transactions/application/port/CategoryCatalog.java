package com.moneywise.transactions.application.port;

import java.util.List;
import java.util.UUID;

public interface CategoryCatalog {

    record Usage(String name, long count) {}

    List<String> findSavedNames(UUID userId);

    List<Usage> findTransactionUsage(UUID userId);

    boolean insert(UUID userId, String name);
}
