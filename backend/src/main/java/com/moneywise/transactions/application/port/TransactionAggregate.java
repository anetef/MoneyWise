package com.moneywise.transactions.application.port;

import java.math.BigDecimal;

import com.moneywise.transactions.domain.TransactionType;

/** Soma persistida por tipo e, para despesas, por categoria. */
public record TransactionAggregate(TransactionType type, String category, BigDecimal amount) {
}
