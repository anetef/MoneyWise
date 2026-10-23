package com.moneywise.shared.exception;


// Classe para exceções que um recurso solicitado não foi encontrado.
public class ResourceNotFoundException extends DomainException {

    // Cnstante que define o código identificador desse tipo de erro.
    public static final String DEFAULT_CODE = "RESOURCE_NOT_FOUND";

    // Construtor da classe
    public ResourceNotFoundException(String message) {

        // chama o construtor da classe pai
        super(DEFAULT_CODE, message);
    }
}