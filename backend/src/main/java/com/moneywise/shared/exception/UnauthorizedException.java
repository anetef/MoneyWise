package com.moneywise.shared.exception;

/** Não foi possível identificar o usuário: credenciais ou token inválidos (401). */
public class UnauthorizedException extends DomainException {

    public static final String DEFAULT_CODE = "UNAUTHORIZED";

    public UnauthorizedException(String message) {
        super(DEFAULT_CODE, message);
    }

    public UnauthorizedException(String code, String message) {
        super(code, message);
    }
}
