package com.moneywise.auth.infrastructure;

import java.util.function.Supplier;

import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import com.moneywise.auth.application.port.UnitOfWork;

@Component
public class AuthTransactionUnitOfWork implements UnitOfWork {

    private final TransactionTemplate transactionTemplate;

    public AuthTransactionUnitOfWork(TransactionTemplate transactionTemplate) {
        this.transactionTemplate = transactionTemplate;
    }

    @Override
    public <T> T inTransaction(Supplier<T> work) {
        return transactionTemplate.execute(status -> work.get());
    }
}