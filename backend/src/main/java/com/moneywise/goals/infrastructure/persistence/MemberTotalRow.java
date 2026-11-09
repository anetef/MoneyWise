package com.moneywise.goals.infrastructure.persistence;

import java.math.BigDecimal;
import java.util.UUID;

public interface MemberTotalRow {

    UUID getUserId();

    BigDecimal getTotal();
}