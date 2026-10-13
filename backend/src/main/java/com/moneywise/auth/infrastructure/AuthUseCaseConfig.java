package com.moneywise.auth.infrastructure;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.moneywise.auth.application.port.PasswordHasher;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.application.usecase.RegisterUser;

/** Cria os casos de uso de auth com as implementações reais dos ports. */
@Configuration
public class AuthUseCaseConfig {

    @Bean
    RegisterUser registerUser(UserRepository userRepository, PasswordHasher passwordHasher) {
        return new RegisterUser(userRepository, passwordHasher);
    }
}