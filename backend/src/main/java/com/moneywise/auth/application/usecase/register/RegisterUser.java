package com.moneywise.auth.application.usecase.register;

import java.util.Currency;

import com.moneywise.auth.application.port.PasswordHasher;
import com.moneywise.auth.application.port.UserRepository;
import com.moneywise.auth.application.usecase.verification.SendVerificationCode;
import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;
import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ConflictException;

/**
 * Caso de uso: cadastrar um usuário.
 * O usuário nasce com o e-mail não confirmado e não recebe tokens .
 */
public class RegisterUser {

    public static final String EMAIL_ALREADY_IN_USE = "EMAIL_ALREADY_IN_USE";
    public static final String INVALID_CURRENCY = "INVALID_CURRENCY";
    private final SendVerificationCode sendVerificationCode;

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;

     public RegisterUser(UserRepository userRepository, PasswordHasher passwordHasher,
                        SendVerificationCode sendVerificationCode) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.sendVerificationCode = sendVerificationCode;
    }

    public User execute(RegisterUserCommand command) {
        Email email = Email.of(command.email());

        // e-mail único. A constraint UNIQUE do banco é a garantia final.
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException(EMAIL_ALREADY_IN_USE, "Este e-mail já está cadastrado.");
        }

        Currency currency = toCurrency(command.currency());
        String passwordHash = passwordHasher.hash(command.password());

        User user = User.register(command.name(), email, passwordHash, currency);
        User saved = userRepository.save(user);
        sendVerificationCode.execute(saved);
        return saved;
    }

    /** a moeda precisa ser um código ISO 4217 válido (ex.: BRL, USD). */
    private static Currency toCurrency(String code) {
        try {
            return Currency.getInstance(code);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BusinessRuleException(INVALID_CURRENCY, "Moeda inválida.");
        }
    }
}