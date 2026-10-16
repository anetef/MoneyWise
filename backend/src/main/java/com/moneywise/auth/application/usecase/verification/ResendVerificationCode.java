package com.moneywise.auth.application.usecase.verification;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

import com.moneywise.auth.application.port.EmailVerificationCodeRepository;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;
import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.TooManyRequestsException;

public class ResendVerificationCode {

    public static final String RESEND_TOO_SOON = "VERIFICATION_RESEND_TOO_SOON";

    private final UserRepository userRepository;
    private final EmailVerificationCodeRepository codes;
    private final SendVerificationCode sendVerificationCode;
    private final Clock clock;

    public ResendVerificationCode(UserRepository userRepository, EmailVerificationCodeRepository codes,
                                  SendVerificationCode sendVerificationCode, Clock clock) {
        this.userRepository = userRepository;
        this.codes = codes;
        this.sendVerificationCode = sendVerificationCode;
        this.clock = clock;
    }

    public void execute(String rawEmail) {
        Optional<User> found = findUser(rawEmail);

        // E-mail desconhecido ou já confirmado: não faz nada e não avisa.
        if (found.isEmpty() || found.get().isEmailVerified()) {
            return;
        }

        User user = found.get();
        Instant now = clock.instant();
        codes.findByUserId(user.getId()).ifPresent(existing -> {
            if (!existing.canResendAt(now)) {
                throw new TooManyRequestsException(RESEND_TOO_SOON,
                        "Aguarde 1 minuto antes de pedir um novo código.");
            }
        });

        sendVerificationCode.execute(user);
    }

    private Optional<User> findUser(String rawEmail) {
        try {
            return userRepository.findByEmail(Email.of(rawEmail));
        } catch (BusinessRuleException | NullPointerException e) {
            return Optional.empty();
        }
    }
}
