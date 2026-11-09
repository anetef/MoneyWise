package com.moneywise.transactions.application.usecase.delete;

import java.time.Clock;
import java.time.YearMonth;
import java.util.UUID;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ResourceNotFoundException;
import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.domain.MonthClosingPolicy;
import com.moneywise.transactions.domain.Transaction;

/** Exclui uma transação própria enquanto seu mês permanece aberto. */
public class DeleteTransaction {

    private final TransactionRepository transactions;
    private final Clock clock;

    public DeleteTransaction(TransactionRepository transactions, Clock clock) {
        this.transactions = transactions;
        this.clock = clock;
    }

    public void execute(UUID id, UUID userId) {
        Transaction current = transactions.findByIdAndUserId(id, userId).orElseThrow(
                () -> new ResourceNotFoundException("Transação não encontrada."));

        if (!MonthClosingPolicy.isEditable(current.getDate(), YearMonth.now(clock))) {
            throw new BusinessRuleException("TRANSACTION_MONTH_CLOSED",
                    "Não é possível excluir transações de um mês fechado.");
        }

        if (!transactions.deleteByIdAndUserId(id, userId)) {
            throw new ResourceNotFoundException("Transação não encontrada.");
        }
    }
}
