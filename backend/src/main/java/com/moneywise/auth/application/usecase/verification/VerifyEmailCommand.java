package com.moneywise.auth.application.usecase.verification;

public record VerifyEmailCommand(String email, String code) {
}