package com.moneywise.transactions.presentation;

import java.net.URI;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.moneywise.shared.web.CurrentUserId;
import com.moneywise.shared.web.ErrorResponse;
import com.moneywise.transactions.application.usecase.delete.DeleteTransaction;
import com.moneywise.transactions.application.usecase.register.RegisterTransaction;
import com.moneywise.transactions.application.usecase.register.RegisterTransactionCommand;
import com.moneywise.transactions.application.usecase.update.UpdateTransaction;
import com.moneywise.transactions.application.usecase.update.UpdateTransactionCommand;
import com.moneywise.transactions.presentation.dto.CreateTransactionRequestDTO;
import com.moneywise.transactions.presentation.dto.TransactionResponseDTO;
import com.moneywise.transactions.presentation.dto.UpdateTransactionRequestDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;

/** Endpoints autenticados para criar, editar e excluir transações. */
@RestController
@RequestMapping("/transactions")
@Tag(name = "Transações", description = "Criação, edição e exclusão de transações do usuário autenticado")
@SecurityRequirement(name = "BearerAuth")
public class TransactionController {

    private final RegisterTransaction registerTransaction;
    private final UpdateTransaction updateTransaction;
    private final DeleteTransaction deleteTransaction;

    public TransactionController(RegisterTransaction registerTransaction, UpdateTransaction updateTransaction,
            DeleteTransaction deleteTransaction) {
        this.registerTransaction = registerTransaction;
        this.updateTransaction = updateTransaction;
        this.deleteTransaction = deleteTransaction;
    }

    @PostMapping
    @Operation(
            operationId = "createTransaction",
            summary = "Criar transação",
            description = "Cria transação com ID do cliente; reenvio do mesmo ID pelo mesmo usuário é idempotente. "
                    + "A moeda vem do perfil. Transações de mês fechado são rejeitadas.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Transação criada",
                    content = @Content(schema = @Schema(implementation = TransactionResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado ou ID pertence a outro usuário",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Transação em mês fechado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<TransactionResponseDTO> create(@Valid @RequestBody CreateTransactionRequestDTO request,
            @CurrentUserId UUID userId) {
        var command = new RegisterTransactionCommand(request.id(), userId, request.amount(), request.date(),
                request.category(), request.type(), request.description());
        TransactionResponseDTO response = TransactionResponseDTO.from(registerTransaction.execute(command));
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(URI.create("/api/v1/transactions/" + response.id()))
                .body(response);
    }

    @PutMapping("/{id}")
    @Operation(
            operationId = "updateTransaction",
            summary = "Editar transação",
            description = "Atualiza transação própria. updatedAt evita que uma alteração antiga sobrescreva a "
                    + "mais recente; registros de outro usuário ou de mês fechado não são editáveis.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transação atualizada ou versão mais recente devolvida",
                    content = @Content(schema = @Schema(implementation = TransactionResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Transação não encontrada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Transação em mês fechado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public TransactionResponseDTO update(@PathVariable UUID id,
            @Valid @RequestBody UpdateTransactionRequestDTO request, @CurrentUserId UUID userId) {
        var command = new UpdateTransactionCommand(id, userId, request.amount(), request.date(), request.category(),
                request.type(), request.description(), request.updatedAt());
        return TransactionResponseDTO.from(updateTransaction.execute(command));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            operationId = "deleteTransaction",
            summary = "Excluir transação",
            description = "Exclui transação própria. Registro de outro usuário retorna 404; mês fechado não pode ser excluído.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Transação excluída"),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Transação não encontrada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Transação em mês fechado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public void delete(@PathVariable UUID id, @CurrentUserId UUID userId) {
        deleteTransaction.execute(id, userId);
    }
}
