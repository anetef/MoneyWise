package com.moneywise.auth.infrastructure.mail;

import com.moneywise.auth.application.port.EmailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;

public class LoggingEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(LoggingEmailSender.class);

    @Override
    public void sendVerificationCode(String to, String userName, String code, Duration expiresIn) {
        log.info("[DEV] Código de verificação para {}: {} (expira em {} min)",
                to, code, expiresIn.toMinutes());
    }
}
