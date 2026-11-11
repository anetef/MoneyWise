package com.moneywise.auth.application.usecase.passwordreset;

import java.time.Clock;

import com.moneywise.auth.application.port.PasswordResetCodeRepository;
import com.moneywise.auth.application.port.UserRepository;

public class VerifyPasswordResetCode {

    private final PasswordResetCodeChecker checker;

    public VerifyPasswordResetCode(UserRepository userRepository, PasswordResetCodeRepository codes, Clock clock) {
        this.checker = new PasswordResetCodeChecker(userRepository, codes, clock);
    }

    public void execute(String email, String code) {
        checker.check(email, code);
    }
}