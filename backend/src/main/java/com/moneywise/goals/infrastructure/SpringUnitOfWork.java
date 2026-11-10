package com.moneywise.goals.infrastructure;

import java.util.function.Supplier;

import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import com.moneywise.goals.application.port.UnitOfWork;

@Component
public class SpringUnitOfWork implements UnitOfWork {

    private final TransactionTemplate transactionTemplate;

    public SpringUnitOfWork(TransactionTemplate transactionTemplate) {
        this.transactionTemplate = transactionTemplate;
    }

    @Override
    public <T> T inTransaction(Supplier<T> work) {
        return transactionTemplate.execute(status -> work.get());
    }
}