package com.moneywise.auth.application.usecase.login;

import java.util.Optional;

import com.moneywise.auth.application.port.PasswordHasher;
import com.moneywise.auth.application.port.TokenService;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;
import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ForbiddenOperationException;
import com.moneywise.shared.exception.UnauthorizedException;

/**
 * Caso de uso: login com e-mail e senha (SEC-06).
 * E-mail inexistente ou senha errada respondem igual (401), para não revelar quais e-mails têm conta.
 * Só entra quem confirmou o e-mail (decisão da equipe).
 */
public class Login {

    public static final String INVALID_CREDENTIALS = "INVALID_CREDENTIALS";
    public static final String EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED";

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final TokenService tokenService;

    /** Hash usado quando o e-mail não existe, só para a resposta levar o mesmo tempo. */
    private final String dummyHash;

    public Login(UserRepository userRepository, PasswordHasher passwordHasher, TokenService tokenService) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
        this.dummyHash = passwordHasher.hash("senha-ficticia-para-igualar-o-tempo");
    }

    public LoginResult execute(LoginCommand command) {
        Optional<User> found = findUser(command.email());

        if (found.isEmpty()) {
            passwordHasher.matches(command.password(), dummyHash);
            throw invalidCredentials();
        }

        User user = found.get();
        if (!passwordHasher.matches(command.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }

        if (!user.isEmailVerified()) {
            throw new ForbiddenOperationException(EMAIL_NOT_VERIFIED, "Confirme seu e-mail antes de entrar.");
        }

        String accessToken = tokenService.issueAccessToken(user.getId());
        String refreshToken = tokenService.issueRefreshToken(user.getId());
        return new LoginResult(user, accessToken, refreshToken);
    }

    /** E-mail em formato inválido é tratado como "não encontrado", para responder 401 igual aos outros casos. */
    private Optional<User> findUser(String rawEmail) {
        try {
            return userRepository.findByEmail(Email.of(rawEmail));
        } catch (BusinessRuleException | NullPointerException e) {
            return Optional.empty();
        }
    }

    private static UnauthorizedException invalidCredentials() {
        return new UnauthorizedException(INVALID_CREDENTIALS, "E-mail ou senha inválidos.");
    }
}