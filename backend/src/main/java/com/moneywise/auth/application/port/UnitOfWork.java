package com.moneywise.auth.application.port;

import java.util.function.Supplier;

public interface UnitOfWork {

    <T> T inTransaction(Supplier<T> work);
}