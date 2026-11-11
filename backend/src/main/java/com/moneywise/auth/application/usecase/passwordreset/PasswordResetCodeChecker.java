package com.moneywise.auth.application.usecase.passwordreset;

import java.time.Clock;
import java.util.Optional;

import com.moneywise.auth.application.port.PasswordResetCodeRepository;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.PasswordResetCode;
import com.moneywise.auth.domain.User;
import com.moneywise.shared.exception.BusinessRuleException;


public class PasswordResetCodeChecker {

    public static final String INVALID_RESET_CODE = "INVALID_RESET_CODE";

    private final UserRepository userRepository;
    private final PasswordResetCodeRepository codes;
    private final Clock clock;

    public PasswordResetCodeChecker(UserRepository userRepository, PasswordResetCodeRepository codes, Clock clock) {
        this.userRepository = userRepository;
        this.codes = codes;
        this.clock = clock;
    }

    public record CheckedCode(User user, PasswordResetCode code) {
    }

    public CheckedCode check(String rawEmail, String rawCode) {
        User user = findUser(rawEmail).orElseThrow(PasswordResetCodeChecker::invalidCode);
        PasswordResetCode code = codes.findByUserId(user.getId()).orElseThrow(PasswordResetCodeChecker::invalidCode);

        if (!code.isUsableAt(clock.instant())) {
            throw invalidCode();
        }
        if (!code.matches(rawCode)) {
            code.registerFailedAttempt();
            codes.save(code);
            throw invalidCode();
        }
        return new CheckedCode(user, code);
    }

    private Optional<User> findUser(String rawEmail) {
        try {
            return userRepository.findByEmail(Email.of(rawEmail));
        } catch (BusinessRuleException | NullPointerException e) {
            return Optional.empty();
        }
    }

    private static BusinessRuleException invalidCode() {
        return new BusinessRuleException(INVALID_RESET_CODE, "Código inválido ou expirado. Peça um novo código.");
    }
}