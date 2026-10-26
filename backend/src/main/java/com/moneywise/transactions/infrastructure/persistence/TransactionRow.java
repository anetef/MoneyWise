package com.moneywise.transactions.infrastructure.persistence;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** Projeção da transação com a moeda configurada no perfil do usuário (RN09). */
public interface TransactionRow {

    UUID getId();

    UUID getUserId();

    BigDecimal getAmount();

    LocalDate getDate();

    String getCategory();

    String getType();

    String getDescription();

    String getCurrency();

    Instant getUpdatedAt();
}
