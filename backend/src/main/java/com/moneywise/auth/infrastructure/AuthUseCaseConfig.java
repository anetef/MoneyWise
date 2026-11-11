package com.moneywise.auth.infrastructure;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.moneywise.auth.application.port.EmailSender;
import com.moneywise.auth.application.port.EmailVerificationCodeRepository;
import com.moneywise.auth.application.port.PasswordHasher;
import com.moneywise.auth.application.port.PasswordResetCodeRepository;
import com.moneywise.auth.application.port.TokenService;
import com.moneywise.auth.application.port.UnitOfWork;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.application.usecase.login.Login;
import com.moneywise.auth.application.usecase.passwordreset.RequestPasswordReset;
import com.moneywise.auth.application.usecase.passwordreset.ResetPassword;
import com.moneywise.auth.application.usecase.passwordreset.VerifyPasswordResetCode;
import com.moneywise.auth.application.usecase.register.RegisterUser;
import com.moneywise.auth.application.usecase.session.Logout;
import com.moneywise.auth.application.usecase.session.RefreshAccessToken;
import com.moneywise.auth.application.usecase.verification.ResendVerificationCode;
import com.moneywise.auth.application.usecase.verification.SendVerificationCode;
import com.moneywise.auth.application.usecase.verification.VerifyEmail;

/** Cria os casos de uso de auth com as implementações reais dos ports. */
@Configuration
public class AuthUseCaseConfig {

    @Bean
    SendVerificationCode sendVerificationCode(EmailVerificationCodeRepository codes,
                                              EmailSender emailSender, Clock clock) {
        return new SendVerificationCode(codes, emailSender, clock);
    }

    @Bean
    RegisterUser registerUser(UserRepository userRepository, PasswordHasher passwordHasher,
                              SendVerificationCode sendVerificationCode) {
        return new RegisterUser(userRepository, passwordHasher, sendVerificationCode);
    }

    @Bean
    Login login(UserRepository userRepository, PasswordHasher passwordHasher, TokenService tokenService) {
        return new Login(userRepository, passwordHasher, tokenService);
    }

    @Bean
    ResendVerificationCode resendVerificationCode(UserRepository userRepository,
                                                  EmailVerificationCodeRepository codes,
                                                  SendVerificationCode sendVerificationCode,
                                                  Clock clock) {
        return new ResendVerificationCode(userRepository, codes, sendVerificationCode, clock);
    }

    @Bean
    VerifyEmail verifyEmail(UserRepository userRepository, EmailVerificationCodeRepository codes,
                            TokenService tokenService, Clock clock) {
        return new VerifyEmail(userRepository, codes, tokenService, clock);
    }

    @Bean
    RefreshAccessToken refreshAccessToken(TokenService tokenService) {
        return new RefreshAccessToken(tokenService);
    }

    @Bean
    Logout logout(TokenService tokenService) {
        return new Logout(tokenService);
    }

    @Bean
    RequestPasswordReset requestPasswordReset(UserRepository userRepository, PasswordResetCodeRepository codes,
                                              EmailSender emailSender, Clock clock) {
        return new RequestPasswordReset(userRepository, codes, emailSender, clock);
    }

    @Bean
    VerifyPasswordResetCode verifyPasswordResetCode(UserRepository userRepository,
                                                    PasswordResetCodeRepository codes, Clock clock) {
        return new VerifyPasswordResetCode(userRepository, codes, clock);
    }

    @Bean
    ResetPassword resetPassword(UserRepository userRepository, PasswordResetCodeRepository codes,
                                PasswordHasher passwordHasher, TokenService tokenService,
                                UnitOfWork unitOfWork, Clock clock) {
        return new ResetPassword(userRepository, codes, passwordHasher, tokenService, unitOfWork, clock);
    }
}