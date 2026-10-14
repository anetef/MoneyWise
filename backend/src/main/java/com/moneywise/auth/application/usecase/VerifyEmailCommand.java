package com.moneywise.auth.application.usecase;

public record VerifyEmailCommand(String email, String code) {
}