package com.moneywise.shared.exception;

// Classe base para exceções de negócio da aplicação. 
// Ela serve para padronizar os erros que acontecem nas regras do domínio.
public abstract class DomainException extends RuntimeException{
    //Guarda um código identificador do erro.
    private final String code;
    
    // Construtor que recebe o codigo e a mensagem do erro
    protected DomainException(String code, String message) {
        super(message);
        this.code = code;
    }

    // getter para recuperar o código do erro.
    public String getCode() {
        return code;
    }
    
}
