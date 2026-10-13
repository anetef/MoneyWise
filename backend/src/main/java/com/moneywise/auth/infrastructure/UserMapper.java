package com.moneywise.auth.infrastructure;

import java.util.Currency;

import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;

/** Converte entre o User do domínio e a UserEntity da JPA. */
final class UserMapper {

    private UserMapper() {
    }

    static UserEntity toEntity(User user) {
        return new UserEntity(
                user.getId(),
                user.getEmail().value(),
                user.getPasswordHash(),
                user.getName(),
                user.getCurrency().getCurrencyCode());
    }

    static User toDomain(UserEntity entity) {
        return User.restore(
                entity.getId(),
                entity.getName(),
                Email.of(entity.getEmail()),
                entity.getPasswordHash(),
                Currency.getInstance(entity.getCurrency()));
    }
}
