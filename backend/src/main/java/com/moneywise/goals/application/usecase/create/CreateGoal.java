package com.moneywise.goals.application.usecase.create;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Currency;
import java.util.Optional;

import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.application.port.UserCurrencyQuery;
import com.moneywise.goals.domain.Goal;
import com.moneywise.groups.application.GroupAuthorizationService;
import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ResourceNotFoundException;
import com.moneywise.shared.money.Money;

public class CreateGoal {

    public static final String INVALID_DEADLINE = "INVALID_GOAL_DEADLINE";

    private final GoalRepository goals;
    private final GroupAuthorizationService authorization;
    private final UserCurrencyQuery currencies;
    private final Clock clock;

    public CreateGoal(GoalRepository goals, GroupAuthorizationService authorization, UserCurrencyQuery currencies,
            Clock clock) {
        this.goals = goals;
        this.authorization = authorization;
        this.currencies = currencies;
        this.clock = clock;
    }

    public Goal execute(CreateGoalCommand command) {
        Optional<Goal> existing = goals.findById(command.id());
        if (existing.isPresent()) {
            return existingForRetry(existing.get(), command);
        }

        authorization.requireAdmin(command.groupId(), command.userId());

        if (command.deadline() != null && command.deadline().isBefore(LocalDate.now(clock))) {
            throw new BusinessRuleException(INVALID_DEADLINE, "O prazo não pode estar no passado.");
        }

        Currency currency = currencies.findCurrencyByUserId(command.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        Goal goal = Goal.create(command.id(), command.groupId(), command.name(),
                new Money(command.targetAmount(), currency), command.deadline(), command.icon(), command.category(),
                command.monthlyReminder(), command.milestonesEnabled(), clock.instant());
        return goals.save(goal);
    }

    private Goal existingForRetry(Goal goal, CreateGoalCommand command) {
        boolean sameGroup = goal.getGroupId().equals(command.groupId());
        if (!sameGroup || !authorization.isMember(goal.getGroupId(), command.userId())) {
            throw new ResourceNotFoundException("Grupo não encontrado.");
        }
        return goal;
    }
}