package com.moneywise.groups.infrastructure;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.moneywise.groups.application.GroupAuthorizationService;
import com.moneywise.groups.application.port.GroupMemberRepository;

/** Liga a autorização de grupos ao port de membros. */
@Configuration
public class GroupUseCaseConfig {

    @Bean
    GroupAuthorizationService groupAuthorizationService(GroupMemberRepository members) {
        return new GroupAuthorizationService(members);
    }
}
