package com.moneywise.goals.application.usecase.contribution;

import java.time.Clock;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.goals.application.port.ContributionRepository;
import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.application.port.UnitOfWork;
import com.moneywise.goals.application.usecase.thermometer.GetGoalThermometer;
import com.moneywise.goals.application.usecase.thermometer.GoalThermometerView;
import com.moneywise.goals.domain.Contribution;
import com.moneywise.goals.domain.Goal;
import com.moneywise.groups.application.GroupAuthorizationService;
import com.moneywise.shared.exception.ResourceNotFoundException;
import com.moneywise.shared.money.Money;


public class RegisterContribution {

    private final GoalRepository goals;
    private final ContributionRepository contributions;
    private final GroupAuthorizationService authorization;
    private final GetGoalThermometer thermometer;
    private final UnitOfWork unitOfWork;
    private final Clock clock;

    public RegisterContribution(GoalRepository goals, ContributionRepository contributions,
            GroupAuthorizationService authorization, GetGoalThermometer thermometer, UnitOfWork unitOfWork,
            Clock clock) {
        this.goals = goals;
        this.contributions = contributions;
        this.authorization = authorization;
        this.thermometer = thermometer;
        this.unitOfWork = unitOfWork;
        this.clock = clock;
    }

    public GoalThermometerView execute(RegisterContributionCommand command) {
        return unitOfWork.inTransaction(() -> register(command));
    }

    private GoalThermometerView register(RegisterContributionCommand command) {
        Goal goal = goals.findByIdForUpdate(command.goalId())
                .filter(found -> authorization.isMember(found.getGroupId(), command.userId()))
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));

        Optional<UUID> alreadyRegisteredIn = contributions.findGoalIdByContributionId(command.id());
        if (alreadyRegisteredIn.isPresent()) {
            if (!alreadyRegisteredIn.get().equals(goal.getId())) {
                throw new ResourceNotFoundException("Meta não encontrada.");
            }
            return thermometer.execute(goal.getId(), command.userId());
        }

        Money amount = new Money(command.amount(), goal.getCurrency());
        Money balance = contributions.balanceOf(goal);
        Contribution contribution = goal.registerContribution(command.id(), command.userId(), command.type(),
                amount, balance, clock.instant());
        contributions.save(contribution);

        return thermometer.execute(goal.getId(), command.userId());
    }
}