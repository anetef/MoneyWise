package com.moneywise.goals.application.usecase.delete;

import java.util.UUID;

import com.moneywise.goals.application.port.ContributionRepository;
import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.application.port.UnitOfWork;
import com.moneywise.goals.domain.Goal;
import com.moneywise.groups.application.GroupAuthorizationService;
import com.moneywise.shared.exception.ResourceNotFoundException;


public class DeleteGoal {

    private final GoalRepository goals;
    private final ContributionRepository contributions;
    private final GroupAuthorizationService authorization;
    private final UnitOfWork unitOfWork;

    public DeleteGoal(GoalRepository goals, ContributionRepository contributions,
            GroupAuthorizationService authorization, UnitOfWork unitOfWork) {
        this.goals = goals;
        this.contributions = contributions;
        this.authorization = authorization;
        this.unitOfWork = unitOfWork;
    }

    public void execute(UUID goalId, UUID userId) {
        unitOfWork.inTransaction(() -> {
            Goal goal = goals.findByIdForUpdate(goalId)
                    .filter(found -> authorization.isMember(found.getGroupId(), userId))
                    .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));
            authorization.requireAdmin(goal.getGroupId(), userId);

            goal.ensureCanBeDeleted(contributions.balanceOf(goal));
            goals.delete(goal);
            return null;
        });
    }
}