package com.moneywise.shared.exception;


// Classe que lanca excecao onde o recurso já existe ou está em um estado incompatível.
public class ConflictException extends DomainException {

    // Cnstante que define o código identificador desse tipo de erro.
    public static final String DEFAULT_CODE = "CONFLICT";

    // Contrutor da classe recebendo uma mensagem 
    public ConflictException(String message) {
        // chama o construtor da classe pai
        super(DEFAULT_CODE, message);
    }

    // Contrutor da classe recebendo uma mensagem e um codigo
    public ConflictException(String code, String message) {
        // chama o construtor da classe pai
        super(code, message);
    }
}
