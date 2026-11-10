package com.moneywise.goals.application.usecase.history;

import com.moneywise.goals.domain.Contribution;

public record ContributionEntry(Contribution contribution, String userName) {
}