package com.moneywise.shared.exception;

// Classe para exceções que uma operação viola uma regra de negócio
public class BusinessRuleException extends DomainException {

    // Cnstante que define o código identificador desse tipo de erro.
    public static final String DEFAULT_CODE = "BUSINESS_RULE_VIOLATION";

    // Contrutor da classe recebendo uma mensagem 
    public BusinessRuleException(String message) {
        // chama o construtor da classe pai
        super(DEFAULT_CODE, message);
    }

    // Contrutor da classe recebendo um código e uma mensagem 
    public BusinessRuleException(String code, String message) {
        // chama o construtor da classe pai
        super(code, message);
    }
}
