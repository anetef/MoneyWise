package com.moneywise.goals.application.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.goals.domain.Goal;

public interface GoalRepository {

    Goal save(Goal goal);

    Optional<Goal> findById(UUID id);

    List<Goal> findByGroupId(UUID groupId);
}