package com.moneywise.auth.application.usecase;

/** Dados para cadastrar um usuário. A validação de formato fica no domínio (Email, User) e no DTO. */
public record RegisterUserCommand(String name, String email, String password, String currency) {
}