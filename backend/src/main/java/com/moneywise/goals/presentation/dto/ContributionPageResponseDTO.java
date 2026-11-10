package com.moneywise.goals.presentation.dto;

import java.util.List;

import com.moneywise.goals.application.usecase.history.ContributionHistory;

public record ContributionPageResponseDTO(List<ContributionResponseDTO> content, int page, int size,
        long totalElements, int totalPages, boolean hasNext) {

    public ContributionPageResponseDTO {
        content = List.copyOf(content);
    }

    public static ContributionPageResponseDTO from(ContributionHistory history) {
        return new ContributionPageResponseDTO(
                history.content().stream().map(ContributionResponseDTO::from).toList(),
                history.page(), history.size(), history.totalElements(), history.totalPages(), history.hasNext());
    }
}