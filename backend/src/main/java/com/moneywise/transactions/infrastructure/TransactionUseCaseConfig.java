package com.moneywise.transactions.infrastructure;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.application.usecase.delete.DeleteTransaction;
import com.moneywise.transactions.application.usecase.register.RegisterTransaction;
import com.moneywise.transactions.application.usecase.update.UpdateTransaction;

/** Liga os casos de uso de transações ao port de persistência e ao relógio da aplicação. */
@Configuration
public class TransactionUseCaseConfig {

    @Bean
    RegisterTransaction registerTransaction(TransactionRepository transactions, Clock clock) {
        return new RegisterTransaction(transactions, clock);
    }

    @Bean
    UpdateTransaction updateTransaction(TransactionRepository transactions, Clock clock) {
        return new UpdateTransaction(transactions, clock);
    }

    @Bean
    DeleteTransaction deleteTransaction(TransactionRepository transactions, Clock clock) {
        return new DeleteTransaction(transactions, clock);
    }
}
