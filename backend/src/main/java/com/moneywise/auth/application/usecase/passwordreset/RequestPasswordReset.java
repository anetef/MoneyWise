package com.moneywise.auth.application.usecase.passwordreset;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

import com.moneywise.auth.application.port.EmailSender;
import com.moneywise.auth.application.port.PasswordResetCodeRepository;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.PasswordResetCode;
import com.moneywise.auth.domain.User;
import com.moneywise.shared.exception.BusinessRuleException;

public class RequestPasswordReset {

    private final UserRepository userRepository;
    private final PasswordResetCodeRepository codes;
    private final EmailSender emailSender;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();

    public RequestPasswordReset(UserRepository userRepository, PasswordResetCodeRepository codes,
            EmailSender emailSender, Clock clock) {
        this.userRepository = userRepository;
        this.codes = codes;
        this.emailSender = emailSender;
        this.clock = clock;
    }

    public void execute(String rawEmail) {
        Optional<User> found = findUser(rawEmail);
        if (found.isEmpty()) {
            return;
        }
        User user = found.get();
        Instant now = clock.instant();

        Optional<PasswordResetCode> existing = codes.findByUserId(user.getId());
        if (existing.isPresent() && !existing.get().canResendAt(now)) {
            return;
        }

        String rawCode = generateCode();
        PasswordResetCode code = existing
                .map(current -> {
                    current.replace(rawCode, now);
                    return current;
                })
                .orElseGet(() -> PasswordResetCode.issue(user.getId(), rawCode, now));
        codes.save(code);

        emailSender.sendPasswordResetCode(user.getEmail().value(), user.getName(), rawCode,
                PasswordResetCode.VALIDITY);
    }

    /** E-mail mal formatado é tratado como e-mail sem conta. */
    private Optional<User> findUser(String rawEmail) {
        try {
            return userRepository.findByEmail(Email.of(rawEmail));
        } catch (BusinessRuleException | NullPointerException e) {
            return Optional.empty();
        }
    }

    /** 6 dígitos, de 000000 a 999999. */
    private String generateCode() {
        return String.format("%06d", random.nextInt(1_000_000));
    }
}
