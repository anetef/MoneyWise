package com.moneywise.auth.application.usecase.login;

/** Dados para fazer login. */
public record LoginCommand(String email, String password) {
}