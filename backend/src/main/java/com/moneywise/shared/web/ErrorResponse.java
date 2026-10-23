package com.moneywise.shared.web;
import java.util.List;

/**
Padroniza as respostas de erro da API
exemplo:
    {
    "code": "VALIDATION_ERROR",
    "message": "Existem campos inválidos",
    "fields": [
        {
        "field": "email",
        "message": "Email inválido"
        }
    ]
    } 
*/
public record ErrorResponse(String code, String message, List<InvalidField> fields) {

    // Um único campo que apresentou erro.
    public record InvalidField(String field, String message) {
    }

    // forma simplificada de criar um ErrorResponse quando não existem erros específicos de campos.
    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(code, message, List.of());
    }
}
