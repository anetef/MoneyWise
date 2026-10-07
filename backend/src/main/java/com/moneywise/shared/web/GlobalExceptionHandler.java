package com.moneywise.shared.web;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.moneywise.shared.exception.BusinessRuleException;
import com.moneywise.shared.exception.ConflictException;
import com.moneywise.shared.exception.DomainException;
import com.moneywise.shared.exception.ForbiddenOperationException;
import com.moneywise.shared.exception.ResourceNotFoundException;

/**
 * Converte as exceções da API em respostas HTTP no formato ErrorResponse.
 * Pertence à camada de apresentação: é o único lugar que traduz erros para HTTP.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    //registrar informações no console/log da aplicação.
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Exceções de domínio 
    // Se alguma dessas excecoes ocorrer, ele chama um dos metodos que saiba trata-la
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex);                  // 404
    }

    @ExceptionHandler(ForbiddenOperationException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenOperationException ex) {
        return build(HttpStatus.FORBIDDEN, ex);                  // 403
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex) {
        return build(HttpStatus.CONFLICT, ex);                   // 409
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRule(BusinessRuleException ex) {
        return build(HttpStatus.UNPROCESSABLE_CONTENT, ex);       // 422
    }

    // Validação (Bean Validation) 

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        // pega os campos que deram errado
        List<ErrorResponse.InvalidField> fields = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ErrorResponse.InvalidField(error.getField(), error.getDefaultMessage()))
                .toList();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)     // 400
                .body(new ErrorResponse("VALIDATION_ERROR", "Um ou mais campos são inválidos.", fields));
    }

    // Erros comuns de quem chama a API 

    // Spring não consegue ler o corpo da requisição.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableBody(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of("MALFORMED_REQUEST", "O corpo da requisição está mal formatado."));
    }

    // Parametro com tipo errado
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of("INVALID_PARAMETER",
                        "O parâmetro '" + ex.getName() + "' tem um valor inválido."));
    }

    // Método HTTP não permitido
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ErrorResponse.of("METHOD_NOT_ALLOWED", "Método HTTP não suportado neste endpoint."));
    }

    // Endpoint inexistente
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoEndpoint(NoResourceFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of("ENDPOINT_NOT_FOUND", "Endpoint não encontrado."));
    }

    //  Pega-tudo , caso o erro nao seja tratado por nenhuma outra funcao
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("Erro inesperado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of("INTERNAL_ERROR",
                        "Ocorreu um erro inesperado. Tente novamente mais tarde."));
    }

    // Evita repetir código.
    private ResponseEntity<ErrorResponse> build(HttpStatus status, DomainException ex) {
        return ResponseEntity.status(status)
                .body(ErrorResponse.of(ex.getCode(), ex.getMessage()));
    }
}