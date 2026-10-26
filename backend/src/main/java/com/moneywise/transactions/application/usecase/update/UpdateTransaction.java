package com.moneywise.transactions.application.usecase.update;

import java.time.Clock;
import java.time.YearMonth;
import java.util.Objects;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ResourceNotFoundException;
import com.moneywise.shared.money.Money;
import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.MonthClosingPolicy;
import com.moneywise.transactions.domain.Transaction;

/** Edita uma transação própria sem permitir que uma versão antiga sobrescreva a mais recente. */
public class UpdateTransaction {

    private final TransactionRepository transactions;
    private final Clock clock;

    public UpdateTransaction(TransactionRepository transactions, Clock clock) {
        this.transactions = transactions;
        this.clock = clock;
    }

    public Transaction execute(UpdateTransactionCommand command) {
        Transaction current = transactions.findByIdAndUserId(command.id(), command.userId()).orElseThrow(
                () -> new ResourceNotFoundException("Transação não encontrada."));

        if (!Objects.equals(current.getUpdatedAt(), command.updatedAt())) {
            return current;
        }

        YearMonth currentMonth = YearMonth.now(clock);
        if (!MonthClosingPolicy.isEditable(current.getDate(), currentMonth)
                || !MonthClosingPolicy.isEditable(command.date(), currentMonth)) {
            throw new BusinessRuleException("TRANSACTION_MONTH_CLOSED",
                    "Não é possível editar transações de um mês fechado.");
        }

        Money amount = new Money(command.amount(), current.getAmount().currency());
        Transaction updated = Transaction.create(command.id(), command.userId(), amount, command.date(),
                Category.of(command.category()), command.type(), command.description());
        return transactions.update(updated, command.updatedAt());
    }
}
