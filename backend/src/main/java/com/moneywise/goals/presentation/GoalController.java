package com.moneywise.goals.presentation;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.moneywise.goals.application.usecase.create.CreateGoal;
import com.moneywise.goals.application.usecase.create.CreateGoalCommand;
import com.moneywise.goals.application.usecase.thermometer.GetGoalThermometer;
import com.moneywise.goals.presentation.dto.CreateGoalRequestDTO;
import com.moneywise.goals.presentation.dto.GoalResponseDTO;
import com.moneywise.goals.presentation.dto.ThermometerResponseDTO;
import com.moneywise.shared.web.CurrentUserId;
import com.moneywise.shared.web.ErrorResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Metas", description = "Caixinhas dos grupos e Termômetro")
@SecurityRequirement(name = "BearerAuth")
public class GoalController {

    private final CreateGoal createGoal;
    private final GetGoalThermometer getGoalThermometer;

    public GoalController(CreateGoal createGoal, GetGoalThermometer getGoalThermometer) {
        this.createGoal = createGoal;
        this.getGoalThermometer = getGoalThermometer;
    }

    @PostMapping("/groups/{groupId}/goals")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Criar meta",
            description = """
                    Cria uma Caixinha no grupo. Só o Admin cria metas (L-17). A moeda da meta é a moeda do perfil \
                    de quem cria (AD-12). O id é gerado no app: o reenvio com o mesmo id por um membro do mesmo \
                    grupo devolve a meta existente, sem alterá-la, também com 201 (seção 6.4, N4). \
                    A Caixinha individual é uma meta num grupo com um membro só (L-06).""")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Meta criada (ou já existente, no reenvio)",
                    content = @Content(schema = @Schema(implementation = GoalResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos (ex.: valor da meta zero ou negativo)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Membro que não é Admin (L-17)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Grupo não encontrado, ou id de meta de outro grupo",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Prazo no passado (INVALID_GOAL_DEADLINE)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public GoalResponseDTO create(@PathVariable UUID groupId, @Valid @RequestBody CreateGoalRequestDTO request,
            @CurrentUserId UUID userId) {
        var command = new CreateGoalCommand(request.id(), groupId, userId, request.name(), request.targetAmount(),
                request.deadline(), request.icon(), request.category(), request.monthlyReminder(),
                request.milestonesEnabled());
        return GoalResponseDTO.from(createGoal.execute(command));
    }

    @GetMapping("/goals/{id}/thermometer")
    @Operation(
            summary = "Consultar Termômetro",
            description = """
                    Estado atual da meta: valor acumulado (entradas − retiradas), valor da meta, prazo, percentual, \
                    status (AD-11) e quanto cada membro acumulou (RF-14). O resultado é o mesmo para todos os \
                    membros (RN01). Usado também na reconexão do app (seção 6.2). Só membros do grupo acessam.""")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Termômetro atual",
                    content = @Content(schema = @Schema(implementation = ThermometerResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Meta não encontrada ou de um grupo do qual não é membro",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ThermometerResponseDTO thermometer(@PathVariable UUID id, @CurrentUserId UUID userId) {
        return ThermometerResponseDTO.from(getGoalThermometer.execute(id, userId));
    }
}