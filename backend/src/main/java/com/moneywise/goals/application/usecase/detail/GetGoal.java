package com.moneywise.goals.application.usecase.detail;

import java.util.UUID;

import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.domain.Goal;
import com.moneywise.groups.application.GroupAuthorizationService;
import com.moneywise.shared.exception.ResourceNotFoundException;

public class GetGoal {

    private final GoalRepository goals;
    private final GroupAuthorizationService authorization;

    public GetGoal(GoalRepository goals, GroupAuthorizationService authorization) {
        this.goals = goals;
        this.authorization = authorization;
    }

    public Goal execute(UUID goalId, UUID userId) {
        return goals.findById(goalId)
                .filter(goal -> authorization.isMember(goal.getGroupId(), userId))
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));
    }
}