package com.moneywise.transactions.application.usecase.register;

import java.time.Clock;
import java.time.YearMonth;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.money.Money;
import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.MonthClosingPolicy;
import com.moneywise.transactions.domain.Transaction;

/** Registra uma transação com UUID do cliente e suporte a reenvio idempotente. */
public class RegisterTransaction {

    public static final String TRANSACTION_MONTH_CLOSED = "TRANSACTION_MONTH_CLOSED";

    private final TransactionRepository transactions;
    private final Clock clock;

    public RegisterTransaction(TransactionRepository transactions, Clock clock) {
        this.transactions = transactions;
        this.clock = clock;
    }

    public Transaction execute(RegisterTransactionCommand command) {
        var existing = transactions.findByIdAndUserId(command.id(), command.userId());
        if (existing.isPresent()) {
            return existing.get();
        }

        if (!MonthClosingPolicy.isEditable(command.date(), YearMonth.now(clock))) {
            throw new BusinessRuleException(TRANSACTION_MONTH_CLOSED,
                    "Não é possível criar transações em um mês fechado.");
        }

        var amount = new Money(command.amount(), transactions.findCurrencyByUserId(command.userId()));
        var transaction = Transaction.create(command.id(), command.userId(), amount, command.date(),
                Category.of(command.category()), command.type(), command.description());
        return transactions.save(transaction);
    }
}
