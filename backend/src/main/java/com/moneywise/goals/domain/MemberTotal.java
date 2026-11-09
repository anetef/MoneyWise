package com.moneywise.goals.domain;

import java.util.UUID;

import com.moneywise.shared.money.Money;

public record MemberTotal(UUID userId, Money total) {
}