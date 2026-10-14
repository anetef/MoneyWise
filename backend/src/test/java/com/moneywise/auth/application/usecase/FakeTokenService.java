package com.moneywise.auth.application.usecase;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.moneywise.auth.application.port.TokenService;

/** TokenService previsível para testes: os tokens são textos com o id do usuário. */
class FakeTokenService implements TokenService {

    private final List<UUID> issuedFor = new ArrayList<>();

    @Override
    public String issueAccessToken(UUID userId) {
        issuedFor.add(userId);
        return "access-" + userId;
    }

    @Override
    public Optional<UUID> validateAccessToken(String accessToken) {
        return Optional.empty();
    }

    @Override
    public String issueRefreshToken(UUID userId) {
        return "refresh-" + userId;
    }

    @Override
    public Optional<UUID> validateRefreshToken(String refreshToken) {
        return Optional.empty();
    }

    @Override
    public void revokeRefreshToken(String refreshToken) {
    }

    /** Quantos access tokens foram emitidos, para conferir que nenhum foi emitido quando o login falha. */
    int issuedCount() {
        return issuedFor.size();
    }
}