package com.moneywise.transactions.application.usecase.monthly;

import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import com.moneywise.shared.money.Money;
import com.moneywise.transactions.application.port.TransactionAggregate;
import com.moneywise.transactions.application.port.TransactionRepository;
import com.moneywise.transactions.domain.TransactionType;

/** Calcula o resumo mensal a partir de agregados isolados por usuário e período. */
public class GetMonthlyTransactionSummary {

    private final TransactionRepository transactions;

    public GetMonthlyTransactionSummary(TransactionRepository transactions) {
        this.transactions = transactions;
    }

    public MonthlyTransactionSummary execute(UUID userId, YearMonth month) {
        var currency = transactions.findCurrencyByUserId(userId);
        Money income = Money.zero(currency);
        Money expense = Money.zero(currency);
        Map<String, Money> expensesByCategory = new LinkedHashMap<>();

        for (TransactionAggregate aggregate : transactions.findMonthlyAggregatesByUserIdAndPeriod(userId,
                month.atDay(1), month.plusMonths(1).atDay(1))) {
            Money amount = new Money(aggregate.amount(), currency);
            if (aggregate.type() == TransactionType.INCOME) {
                income = income.plus(amount);
            } else if (aggregate.type() == TransactionType.EXPENSE) {
                expense = expense.plus(amount);
                expensesByCategory.merge(aggregate.category(), amount, Money::plus);
            }
        }

        var categoryExpenses = expensesByCategory.entrySet().stream()
                .map(entry -> new MonthlyTransactionSummary.CategoryExpense(entry.getKey(), entry.getValue().amount()))
                .sorted(Comparator.comparing(MonthlyTransactionSummary.CategoryExpense::amount).reversed()
                        .thenComparing(MonthlyTransactionSummary.CategoryExpense::category))
                .toList();

        return new MonthlyTransactionSummary(month, currency.getCurrencyCode(), income.amount(), expense.amount(),
                income.minus(expense).amount(), categoryExpenses);
    }
}
