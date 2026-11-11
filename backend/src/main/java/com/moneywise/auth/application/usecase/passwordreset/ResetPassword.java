package com.moneywise.auth.application.usecase.passwordreset;

import java.time.Clock;
import java.time.Instant;

import com.moneywise.auth.application.port.PasswordHasher;
import com.moneywise.auth.application.port.PasswordResetCodeRepository;
import com.moneywise.auth.application.port.TokenService;
import com.moneywise.auth.application.port.UnitOfWork;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.application.usecase.passwordreset.PasswordResetCodeChecker.CheckedCode;
import com.moneywise.auth.domain.User;

public class ResetPassword {

    private final PasswordResetCodeChecker checker;
    private final UserRepository userRepository;
    private final PasswordResetCodeRepository codes;
    private final PasswordHasher passwordHasher;
    private final TokenService tokenService;
    private final UnitOfWork unitOfWork;
    private final Clock clock;

    public ResetPassword(UserRepository userRepository, PasswordResetCodeRepository codes,
            PasswordHasher passwordHasher, TokenService tokenService, UnitOfWork unitOfWork, Clock clock) {
        this.checker = new PasswordResetCodeChecker(userRepository, codes, clock);
        this.userRepository = userRepository;
        this.codes = codes;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
        this.unitOfWork = unitOfWork;
        this.clock = clock;
    }

    public void execute(ResetPasswordCommand command) {
        CheckedCode checked = checker.check(command.email(), command.code());

        String newPasswordHash = passwordHasher.hash(command.newPassword());
        Instant now = clock.instant();

        unitOfWork.inTransaction(() -> {
            User user = checked.user();
            user.changePassword(newPasswordHash);
            user.markEmailVerified(now);
            userRepository.save(user);

            checked.code().markUsed(now);
            codes.save(checked.code());

            tokenService.revokeAllRefreshTokens(user.getId());
            return null;
        });
    }
}