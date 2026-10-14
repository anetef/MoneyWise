package com.moneywise.auth.application.usecase;

/** Dados para fazer login. */
public record LoginCommand(String email, String password) {
}