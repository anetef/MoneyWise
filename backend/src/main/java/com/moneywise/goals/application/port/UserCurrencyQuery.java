package com.moneywise.goals.application.port;

import java.util.Currency;
import java.util.Optional;
import java.util.UUID;

public interface UserCurrencyQuery {

    Optional<Currency> findCurrencyByUserId(UUID userId);
}
