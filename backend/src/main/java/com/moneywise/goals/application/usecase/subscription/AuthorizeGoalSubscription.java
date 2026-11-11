package com.moneywise.goals.application.usecase.subscription;

import java.util.UUID;

import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.groups.application.GroupAuthorizationService;


public class AuthorizeGoalSubscription {

    private final GoalRepository goals;
    private final GroupAuthorizationService authorization;

    public AuthorizeGoalSubscription(GoalRepository goals, GroupAuthorizationService authorization) {
        this.goals = goals;
        this.authorization = authorization;
    }

    public boolean canSubscribe(UUID goalId, UUID userId) {
        return goals.findById(goalId)
                .map(goal -> authorization.isMember(goal.getGroupId(), userId))
                .orElse(false);
    }
}