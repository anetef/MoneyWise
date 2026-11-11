package com.moneywise.auth.application.usecase;

import java.util.function.Supplier;

import com.moneywise.auth.application.port.UnitOfWork;

class FakeUnitOfWork implements UnitOfWork {

    @Override
    public <T> T inTransaction(Supplier<T> work) {
        return work.get();
    }
}