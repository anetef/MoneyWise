
package com.moneywise.auth.application.usecase.profile;

import java.util.Objects;
import java.util.UUID;

import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.User;
import com.moneywise.shared.exception.UnauthorizedException;

public final class GetCurrentUser {

    private final UserRepository users;

    public GetCurrentUser(UserRepository users) {
        this.users = Objects.requireNonNull(users);
    }

    public User execute(UUID userId) {
        Objects.requireNonNull(userId, "userId é obrigatório.");

        return users.findById(userId)
                .orElseThrow(() -> new UnauthorizedException(
                        "USER_NOT_FOUND",
                        "Sua sessão não é mais válida. Faça login novamente."
                ));
    }
}
