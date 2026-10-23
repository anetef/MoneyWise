package com.moneywise.shared.exception;

// Classe para excecoes onde o usuário não tem permissão para a operação.
public class ForbiddenOperationException extends DomainException {
    // Cnstante que define o código identificador desse tipo de erro.
    public static final String DEFAULT_CODE = "FORBIDDEN";

    // Contrutor da classe recebendo uma mensagem 
    public ForbiddenOperationException(String message) {
        // chama o construtor da classe pai
        super(DEFAULT_CODE, message);
    }

     // Contrutor da classe recebendo um codigo e uma mensagem 
    public ForbiddenOperationException(String code, String message) {
        // chama o construtor da classe pai
        super(code, message);
    }
}