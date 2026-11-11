package com.moneywise.auth.application.usecase.passwordreset;

public record ResetPasswordCommand(String email, String code, String newPassword) {
}