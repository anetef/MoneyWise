package com.moneywise.auth.application.usecase;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.auth.application.port.TokenService;

/** TokenService falso que guarda os refresh tokens ativos em memória. */
class FakeRefreshTokenService implements TokenService {

    private final Map<String, UUID> activeRefreshTokens = new HashMap<>();
    private int counter;

    @Override
    public String issueAccessToken(UUID userId) {
        return "access-" + userId + "-" + (++counter);
    }

    @Override
    public Optional<UUID> validateAccessToken(String accessToken) {
        return Optional.empty();
    }

    @Override
    public String issueRefreshToken(UUID userId) {
        String token = "refresh-" + userId + "-" + (++counter);
        activeRefreshTokens.put(token, userId);
        return token;
    }

    @Override
    public Optional<UUID> validateRefreshToken(String refreshToken) {
        return Optional.ofNullable(activeRefreshTokens.get(refreshToken));
    }

    @Override
    public void revokeRefreshToken(String refreshToken) {
        activeRefreshTokens.remove(refreshToken);
    }
}