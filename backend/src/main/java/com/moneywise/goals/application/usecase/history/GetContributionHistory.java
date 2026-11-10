package com.moneywise.goals.application.usecase.history;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import com.moneywise.goals.application.port.ContributionPage;
import com.moneywise.goals.application.port.ContributionRepository;
import com.moneywise.goals.application.port.ContributorNameQuery;
import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.domain.Contribution;
import com.moneywise.goals.domain.Goal;
import com.moneywise.groups.application.GroupAuthorizationService;
import com.moneywise.shared.exception.ResourceNotFoundException;

public class GetContributionHistory {

    public static final int MAX_PAGE_SIZE = 100;

    private final GoalRepository goals;
    private final ContributionRepository contributions;
    private final ContributorNameQuery names;
    private final GroupAuthorizationService authorization;

    public GetContributionHistory(GoalRepository goals, ContributionRepository contributions,
            ContributorNameQuery names, GroupAuthorizationService authorization) {
        this.goals = goals;
        this.contributions = contributions;
        this.names = names;
        this.authorization = authorization;
    }

    public ContributionHistory execute(UUID goalId, UUID userId, int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("A página deve ser maior ou igual a zero.");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException("O tamanho da página deve estar entre 1 e 100.");
        }

        Goal goal = goals.findById(goalId)
                .filter(found -> authorization.isMember(found.getGroupId(), userId))
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));

        ContributionPage result = contributions.findHistory(goal, page, size);
        Map<UUID, String> namesById = names.findNamesByUserIds(
                result.content().stream().map(Contribution::getUserId).filter(Objects::nonNull).distinct().toList());

        return new ContributionHistory(
                result.content().stream()
                        .map(c -> new ContributionEntry(c, c.getUserId() == null ? null : namesById.get(c.getUserId())))
                        .toList(),
                result.page(), result.size(), result.totalElements(), result.totalPages(), result.hasNext());
    }
}
