package com.moneywise.goals.application.usecase.thermometer;

import java.util.UUID;

import com.moneywise.shared.money.Money;


public record ContributorTotal(UUID userId, String name, Money total) {
}