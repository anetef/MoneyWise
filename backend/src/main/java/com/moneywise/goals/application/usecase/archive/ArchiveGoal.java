package com.moneywise.goals.application.usecase.archive;

import java.util.UUID;

import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.application.port.UnitOfWork;
import com.moneywise.goals.domain.Goal;
import com.moneywise.groups.application.GroupAuthorizationService;
import com.moneywise.shared.exception.ResourceNotFoundException;


public class ArchiveGoal {

    private final GoalRepository goals;
    private final GroupAuthorizationService authorization;
    private final UnitOfWork unitOfWork;

    public ArchiveGoal(GoalRepository goals, GroupAuthorizationService authorization, UnitOfWork unitOfWork) {
        this.goals = goals;
        this.authorization = authorization;
        this.unitOfWork = unitOfWork;
    }

    public Goal archive(UUID goalId, UUID userId) {
        return change(goalId, userId, true);
    }

    public Goal unarchive(UUID goalId, UUID userId) {
        return change(goalId, userId, false);
    }

    private Goal change(UUID goalId, UUID userId, boolean archived) {
        return unitOfWork.inTransaction(() -> {
            Goal goal = goals.findByIdForUpdate(goalId)
                    .filter(found -> authorization.isMember(found.getGroupId(), userId))
                    .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));
            authorization.requireAdmin(goal.getGroupId(), userId);

            Goal changed = archived ? goal.archive() : goal.unarchive();
            return changed == goal ? goal : goals.save(changed);
        });
    }
}