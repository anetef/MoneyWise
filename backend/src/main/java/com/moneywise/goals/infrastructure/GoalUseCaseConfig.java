package com.moneywise.goals.infrastructure;

import java.time.Clock;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.moneywise.goals.application.port.ContributionRepository;
import com.moneywise.goals.application.port.ContributorNameQuery;
import com.moneywise.goals.application.port.GoalRepository;
import com.moneywise.goals.application.port.UserCurrencyQuery;
import com.moneywise.goals.application.usecase.create.CreateGoal;
import com.moneywise.goals.application.usecase.delete.DeleteGoal;
import com.moneywise.goals.application.usecase.detail.GetGoal;
import com.moneywise.goals.application.usecase.history.GetContributionHistory;
import com.moneywise.goals.application.usecase.list.ListGoals;
import com.moneywise.goals.application.usecase.subscription.AuthorizeGoalSubscription;
import com.moneywise.goals.application.usecase.thermometer.GetGoalThermometer;
import com.moneywise.goals.application.usecase.update.UpdateGoal;
import com.moneywise.groups.application.GroupAuthorizationService;
import com.moneywise.goals.application.port.UnitOfWork;
import com.moneywise.goals.application.usecase.archive.ArchiveGoal;
import com.moneywise.goals.application.usecase.contribution.RegisterContribution;

@Configuration
public class GoalUseCaseConfig {

    @Bean
    CreateGoal createGoal(GoalRepository goals, GroupAuthorizationService authorization,
            UserCurrencyQuery currencies, @Qualifier("transactionBusinessClock") Clock clock) {
        return new CreateGoal(goals, authorization, currencies, clock);
    }

    @Bean
    GetGoalThermometer getGoalThermometer(GoalRepository goals, ContributionRepository contributions,
            ContributorNameQuery names, GroupAuthorizationService authorization,
            @Qualifier("transactionBusinessClock") Clock clock) {
        return new GetGoalThermometer(goals, contributions, names, authorization, clock);
    }

    @Bean
    RegisterContribution registerContribution(GoalRepository goals, ContributionRepository contributions,
            GroupAuthorizationService authorization, GetGoalThermometer thermometer, UnitOfWork unitOfWork,
            @Qualifier("transactionBusinessClock") Clock clock) {
        return new RegisterContribution(goals, contributions, authorization, thermometer, unitOfWork, clock);
    }

        @Bean
    ListGoals listGoals(GoalRepository goals, ContributionRepository contributions,
            GroupAuthorizationService authorization, @Qualifier("transactionBusinessClock") Clock clock) {
        return new ListGoals(goals, contributions, authorization, clock);
    }

    @Bean
    GetGoal getGoal(GoalRepository goals, GroupAuthorizationService authorization) {
        return new GetGoal(goals, authorization);
    }

    @Bean
    GetContributionHistory getContributionHistory(GoalRepository goals, ContributionRepository contributions,
            ContributorNameQuery names, GroupAuthorizationService authorization) {
        return new GetContributionHistory(goals, contributions, names, authorization);
    }

    @Bean
    UpdateGoal updateGoal(GoalRepository goals, GroupAuthorizationService authorization, UnitOfWork unitOfWork,
            @Qualifier("transactionBusinessClock") Clock clock) {
        return new UpdateGoal(goals, authorization, unitOfWork, clock);
    }

    @Bean
    ArchiveGoal archiveGoal(GoalRepository goals, GroupAuthorizationService authorization, UnitOfWork unitOfWork) {
        return new ArchiveGoal(goals, authorization, unitOfWork);
    }

    @Bean
    DeleteGoal deleteGoal(GoalRepository goals, ContributionRepository contributions,
            GroupAuthorizationService authorization, UnitOfWork unitOfWork) {
        return new DeleteGoal(goals, contributions, authorization, unitOfWork);
    }

    @Bean
    AuthorizeGoalSubscription authorizeGoalSubscription(GoalRepository goals,
            GroupAuthorizationService authorization) {
        return new AuthorizeGoalSubscription(goals, authorization);
    }
}