package com.moneywise.auth.application.usecase;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;

import com.moneywise.auth.application.port.EmailSender;
import com.moneywise.auth.application.port.EmailVerificationCodeRepository;
import com.moneywise.auth.domain.EmailVerificationCode;
import com.moneywise.auth.domain.User;

public class SendVerificationCode {

    private final EmailVerificationCodeRepository codes;
    private final EmailSender emailSender;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();

    public SendVerificationCode(EmailVerificationCodeRepository codes, EmailSender emailSender, Clock clock) {
        this.codes = codes;
        this.emailSender = emailSender;
        this.clock = clock;
    }

    public void execute(User user) {
        Instant now = clock.instant();
        String rawCode = generateCode();

        EmailVerificationCode code = codes.findByUserId(user.getId())
                .map(existing -> {
                    existing.replace(rawCode, now);
                    return existing;
                })
                .orElseGet(() -> EmailVerificationCode.issue(user.getId(), rawCode, now));

        codes.save(code);
        emailSender.sendVerificationCode(user.getEmail().value(), user.getName(), rawCode,
                EmailVerificationCode.VALIDITY);
    }

    /** 6 dígitos, de 000000 a 999999. */
    private String generateCode() {
        return String.format("%06d", random.nextInt(1_000_000));
    }
}
