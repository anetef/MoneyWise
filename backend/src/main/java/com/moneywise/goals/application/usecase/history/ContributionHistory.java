package com.moneywise.goals.application.usecase.history;

import java.util.List;

public record ContributionHistory(List<ContributionEntry> content, int page, int size, long totalElements,
        int totalPages, boolean hasNext) {

    public ContributionHistory {
        content = List.copyOf(content);
    }
}