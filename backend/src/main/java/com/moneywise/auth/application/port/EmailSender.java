package com.moneywise.auth.application.port;

import java.time.Duration;

public interface EmailSender {

    void sendVerificationCode(String to, String userName, String code, Duration expiresIn);
}
