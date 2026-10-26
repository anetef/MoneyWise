package com.moneywise.transactions.infrastructure;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.application.usecase.delete.DeleteTransaction;
import com.moneywise.transactions.application.usecase.list.ListTransactions;
import com.moneywise.transactions.application.usecase.monthly.GetMonthlyTransactionSummary;
import com.moneywise.transactions.application.usecase.register.RegisterTransaction;
import com.moneywise.transactions.application.usecase.update.UpdateTransaction;

/** Liga os casos de uso de transações ao port de persistência e ao relógio de negócio. */
@Configuration
public class TransactionUseCaseConfig {

    @Bean("transactionBusinessClock")
    Clock transactionBusinessClock() {
        return Clock.system(ZoneId.of("America/Sao_Paulo"));
    }

    @Bean
    RegisterTransaction registerTransaction(TransactionRepository transactions,
            @Qualifier("transactionBusinessClock") Clock clock) {
        return new RegisterTransaction(transactions, clock);
    }

    @Bean
    ListTransactions listTransactions(TransactionRepository transactions) {
        return new ListTransactions(transactions);
    }

    @Bean
    GetMonthlyTransactionSummary getMonthlyTransactionSummary(TransactionRepository transactions) {
        return new GetMonthlyTransactionSummary(transactions);
    }

    @Bean
    UpdateTransaction updateTransaction(TransactionRepository transactions,
            @Qualifier("transactionBusinessClock") Clock clock) {
        return new UpdateTransaction(transactions, clock);
    }

    @Bean
    DeleteTransaction deleteTransaction(TransactionRepository transactions,
            @Qualifier("transactionBusinessClock") Clock clock) {
        return new DeleteTransaction(transactions, clock);
    }
}
