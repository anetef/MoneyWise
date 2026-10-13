package com.moneywise.auth.application.port;


/** Embaralha e confere senhas. Implementado na infrastructure . */
public interface PasswordHasher {

    /** Transforma a senha digitada em um hash para guardar no banco. */
    String hash(String rawPassword);

    /** Confere se a senha digitada corresponde ao hash guardado. */
    boolean matches(String rawPassword, String passwordHash);
}
