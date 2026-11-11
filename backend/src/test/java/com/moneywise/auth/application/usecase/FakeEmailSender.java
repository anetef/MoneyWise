package com.moneywise.auth.application.usecase;

import java.time.Duration;

import com.moneywise.auth.application.port.EmailSender;

class FakeEmailSender implements EmailSender {

    int sentCount;
    String lastTo;
    String lastCode;

    int passwordResetSentCount;
    String lastPasswordResetTo;
    String lastPasswordResetCode;

    @Override
    public void sendVerificationCode(String to, String userName, String code, Duration expiresIn) {
        sentCount++;
        lastTo = to;
        lastCode = code;
    }

    @Override
    public void sendPasswordResetCode(String to, String userName, String code, Duration expiresIn) {
        passwordResetSentCount++;
        lastPasswordResetTo = to;
        lastPasswordResetCode = code;
    }
}