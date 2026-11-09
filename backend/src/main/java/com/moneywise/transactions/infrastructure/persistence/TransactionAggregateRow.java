package com.moneywise.transactions.infrastructure.persistence;

import java.math.BigDecimal;

/** Projeção de soma por tipo e categoria retornada pelo PostgreSQL. */
public interface TransactionAggregateRow {

    String getType();

    String getCategory();

    BigDecimal getAmount();
}
