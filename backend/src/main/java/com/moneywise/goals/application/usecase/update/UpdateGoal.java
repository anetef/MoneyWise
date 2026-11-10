package com.moneywise.goals.application.usecase.update;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Objects;

import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.application.port.UnitOfWork;
import com.moneywise.goals.application.usecase.create.CreateGoal;
import com.moneywise.goals.domain.Goal;
import com.moneywise.groups.application.GroupAuthorizationService;
import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ResourceNotFoundException;


public class UpdateGoal {

    private final GoalRepository goals;
    private final GroupAuthorizationService authorization;
    private final UnitOfWork unitOfWork;
    private final Clock clock;

    public UpdateGoal(GoalRepository goals, GroupAuthorizationService authorization, UnitOfWork unitOfWork,
            Clock clock) {
        this.goals = goals;
        this.authorization = authorization;
        this.unitOfWork = unitOfWork;
        this.clock = clock;
    }

    public Goal execute(UpdateGoalCommand command) {
        return unitOfWork.inTransaction(() -> {
            Goal goal = goals.findByIdForUpdate(command.goalId())
                    .filter(found -> authorization.isMember(found.getGroupId(), command.userId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));
            authorization.requireAdmin(goal.getGroupId(), command.userId());

            boolean deadlineChanged = !Objects.equals(goal.getDeadline(), command.deadline());
            if (deadlineChanged && command.deadline() != null
                    && command.deadline().isBefore(LocalDate.now(clock))) {
                throw new BusinessRuleException(CreateGoal.INVALID_DEADLINE, "O prazo não pode estar no passado.");
            }

            Goal updated = goal.update(command.name(), command.targetAmount(), command.deadline(), command.icon(),
                    command.category(), command.monthlyReminder(), command.milestonesEnabled());
            return goals.save(updated);
        });
    }
}
