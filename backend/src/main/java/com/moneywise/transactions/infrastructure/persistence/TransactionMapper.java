package com.moneywise.transactions.infrastructure.persistence;

import java.util.Currency;

import com.moneywise.shared.money.Money;
import com.moneywise.transactions.domain.Category;
import com.moneywise.transactions.domain.Transaction;
import com.moneywise.transactions.domain.TransactionType;

/** Conversão entre domínio e persistência. */
final class TransactionMapper {

    private TransactionMapper() {
    }

    static TransactionEntity toEntity(Transaction transaction) {
        return new TransactionEntity(transaction.getId(), transaction.getUserId(), transaction.getAmount().amount(),
                transaction.getDate(), transaction.getCategory().name(), transaction.getType().name(),
                transaction.getDescription());
    }

    static Transaction toDomain(TransactionRow row) {
        return Transaction.restore(row.getId(), row.getUserId(),
                new Money(row.getAmount(), Currency.getInstance(row.getCurrency().strip())), row.getDate(),
                Category.of(row.getCategory()), TransactionType.valueOf(row.getType()), row.getDescription(),
                row.getUpdatedAt());
    }
}
