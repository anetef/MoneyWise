package com.moneywise.goals.application.port;

import java.util.List;

import com.moneywise.goals.domain.Contribution;

public record ContributionPage(List<Contribution> content, int page, int size, long totalElements, int totalPages,
        boolean hasNext) {

    public ContributionPage {
        content = List.copyOf(content);
    }
}