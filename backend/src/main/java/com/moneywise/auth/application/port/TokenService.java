package com.moneywise.auth.application.port;


import java.util.Optional;
import java.util.UUID;

/**
 * Emite e valida os tokens de autenticação .
 * Implementado na infrastructure .
 */
public interface TokenService {

    /** Emite um access token de curta duração para o usuário. */
    String issueAccessToken(UUID userId);

    /** Devolve o id do usuário se o access token for válido; vazio se for inválido, adulterado ou expirado. */
    Optional<UUID> validateAccessToken(String accessToken);

    /** Emite um refresh token, usado para obter um novo access token. */
    String issueRefreshToken(UUID userId);

     /** Devolve o id do usuário se o refresh token existir, não estiver expirado e não tiver sido revogado; vazio caso contrário. */
    Optional<UUID> validateRefreshToken(String refreshToken);

    /** Revoga um refresh token (logout ou rotação). Depois disso, ele não é mais aceito. */
    void revokeRefreshToken(String refreshToken);
}
