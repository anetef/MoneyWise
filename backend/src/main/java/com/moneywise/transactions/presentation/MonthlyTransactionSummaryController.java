package com.moneywise.transactions.presentation;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.moneywise.shared.web.CurrentUserId;
import com.moneywise.shared.web.ErrorResponse;
import com.moneywise.transactions.application.usecase.monthly.GetMonthlyTransactionSummary;
import com.moneywise.transactions.presentation.dto.MonthlyTransactionSummaryResponseDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

/** Resumo mensal autenticado para alimentar o Dashboard financeiro. */
@RestController
@Tag(name = "Relatórios", description = "Resumo financeiro mensal do usuário autenticado")
@SecurityRequirement(name = "BearerAuth")
public class MonthlyTransactionSummaryController {

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("uuuu-MM")
            .withResolverStyle(java.time.format.ResolverStyle.STRICT);

    private final GetMonthlyTransactionSummary getMonthlyTransactionSummary;

    public MonthlyTransactionSummaryController(GetMonthlyTransactionSummary getMonthlyTransactionSummary) {
        this.getMonthlyTransactionSummary = getMonthlyTransactionSummary;
    }

    @GetMapping("/reports/monthly")
    @Operation(operationId = "getMonthlyTransactionSummary", summary = "Consultar resumo mensal",
            description = "Retorna receitas, despesas, saldo e despesas por categoria no mês informado. "
                    + "Os valores usam a moeda do perfil e consideram somente o usuário autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resumo mensal",
                    content = @Content(schema = @Schema(implementation = MonthlyTransactionSummaryResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Mês inválido",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> getMonthlySummary(
            @Parameter(description = "Mês no formato AAAA-MM", example = "2026-10")
            @RequestParam String month,
            @CurrentUserId UUID userId) {
        final YearMonth yearMonth;
        try {
            if (month == null || !month.matches("\\d{4}-(0[1-9]|1[0-2])")) {
                throw new DateTimeParseException("Formato esperado: AAAA-MM", String.valueOf(month), 0);
            }
            yearMonth = YearMonth.parse(month, MONTH_FORMAT);
        } catch (DateTimeParseException exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ErrorResponse.of("INVALID_PARAMETER", "O parâmetro 'month' deve usar o formato AAAA-MM."));
        }

        return ResponseEntity.ok(MonthlyTransactionSummaryResponseDTO.from(
                getMonthlyTransactionSummary.execute(userId, yearMonth)));
    }
}
