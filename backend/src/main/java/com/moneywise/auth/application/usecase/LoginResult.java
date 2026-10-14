package com.moneywise.auth.application.usecase;

import com.moneywise.auth.domain.User;

/** Resultado de um login bem-sucedido: o usuário e os dois tokens. */
public record LoginResult(User user, String accessToken, String refreshToken) {
}
