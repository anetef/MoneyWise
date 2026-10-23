package com.moneywise.auth.application.port;

import java.util.Optional;
import java.util.UUID;

import com.moneywise.auth.domain.Email;
import com.moneywise.auth.domain.User;

/** Guarda e busca usuários. Implementado na infrastructure. */
public interface UserRepository {

    Optional<User> findById(UUID id);

    Optional<User> findByEmail(Email email);

    /** Usado no cadastro para checar a RN06 (e-mail único) antes de salvar. */
    boolean existsByEmail(Email email);

    /** Salva um usuário novo ou atualiza um existente. */
    User save(User user);
}
