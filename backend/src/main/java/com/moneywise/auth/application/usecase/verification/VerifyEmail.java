package com.moneywise.auth.application.usecase.verification;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

import com.moneywise.auth.application.port.EmailVerificationCodeRepository;
import com.moneywise.auth.application.port.TokenService;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.application.usecase.login.LoginResult;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.EmailVerificationCode;
import com.moneywise.auth.domain.User;
import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ConflictException;

public class VerifyEmail {

    public static final String INVALID_VERIFICATION_CODE = "INVALID_VERIFICATION_CODE";
    public static final String VERIFICATION_CODE_EXPIRED = "VERIFICATION_CODE_EXPIRED";
    public static final String VERIFICATION_ATTEMPTS_EXCEEDED = "VERIFICATION_ATTEMPTS_EXCEEDED";
    public static final String EMAIL_ALREADY_VERIFIED = "EMAIL_ALREADY_VERIFIED";

    private final UserRepository userRepository;
    private final EmailVerificationCodeRepository codes;
    private final TokenService tokenService;
    private final Clock clock;

    public VerifyEmail(UserRepository userRepository, EmailVerificationCodeRepository codes,
                       TokenService tokenService, Clock clock) {
        this.userRepository = userRepository;
        this.codes = codes;
        this.tokenService = tokenService;
        this.clock = clock;
    }

    public LoginResult execute(VerifyEmailCommand command) {
        User user = findUser(command.email()).orElseThrow(VerifyEmail::invalidCode);

        if (user.isEmailVerified()) {
            throw new ConflictException(EMAIL_ALREADY_VERIFIED, "Este e-mail já foi confirmado.");
        }

        EmailVerificationCode code = codes.findByUserId(user.getId()).orElseThrow(VerifyEmail::invalidCode);
        Instant now = clock.instant();

        if (code.isExpiredAt(now)) {
            throw new BusinessRuleException(VERIFICATION_CODE_EXPIRED, "O código expirou. Peça um novo.");
        }
        if (code.hasExhaustedAttempts()) {
            throw new BusinessRuleException(VERIFICATION_ATTEMPTS_EXCEEDED,
                    "Muitas tentativas erradas. Peça um novo código.");
        }
        if (!code.matches(command.code())) {
            code.registerFailedAttempt();
            codes.save(code);
            throw invalidCode();
        }

        user.markEmailVerified(now);
        userRepository.save(user);
        codes.deleteByUserId(user.getId());

        String accessToken = tokenService.issueAccessToken(user.getId());
        String refreshToken = tokenService.issueRefreshToken(user.getId());
        return new LoginResult(user, accessToken, refreshToken);
    }

    private Optional<User> findUser(String rawEmail) {
        try {
            return userRepository.findByEmail(Email.of(rawEmail));
        } catch (BusinessRuleException | NullPointerException e) {
            return Optional.empty();
        }
    }

    private static BusinessRuleException invalidCode() {
        return new BusinessRuleException(INVALID_VERIFICATION_CODE, "Código inválido.");
    }
}
