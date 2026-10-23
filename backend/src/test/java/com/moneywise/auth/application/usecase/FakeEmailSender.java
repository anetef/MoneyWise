package com.moneywise.auth.application.usecase;

import java.time.Duration;

import com.moneywise.auth.application.port.EmailSender;

class FakeEmailSender implements EmailSender {

    int sentCount;
    String lastTo;
    String lastCode;

    @Override
    public void sendVerificationCode(String to, String userName, String code, Duration expiresIn) {
        sentCount++;
        lastTo = to;
        lastCode = code;
    }
}
