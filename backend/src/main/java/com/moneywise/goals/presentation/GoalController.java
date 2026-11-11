package com.moneywise.goals.presentation;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.moneywise.goals.application.usecase.archive.ArchiveGoal;
import com.moneywise.goals.application.usecase.contribution.RegisterContribution;
import com.moneywise.goals.application.usecase.contribution.RegisterContributionCommand;
import com.moneywise.goals.application.usecase.create.CreateGoal;
import com.moneywise.goals.application.usecase.create.CreateGoalCommand;
import com.moneywise.goals.application.usecase.delete.DeleteGoal;
import com.moneywise.goals.application.usecase.detail.GetGoal;
import com.moneywise.goals.application.usecase.history.GetContributionHistory;
import com.moneywise.goals.application.usecase.list.ListGoals;
import com.moneywise.goals.application.usecase.update.UpdateGoal;
import com.moneywise.goals.application.usecase.update.UpdateGoalCommand;
import com.moneywise.goals.application.usecase.thermometer.GetGoalThermometer;
import com.moneywise.goals.presentation.dto.ContributionPageResponseDTO;
import com.moneywise.goals.presentation.dto.CreateContributionRequestDTO;
import com.moneywise.goals.presentation.dto.CreateGoalRequestDTO;
import com.moneywise.goals.presentation.dto.GoalResponseDTO;
import com.moneywise.goals.presentation.dto.GoalSummaryResponseDTO;
import com.moneywise.goals.presentation.dto.ThermometerResponseDTO;
import com.moneywise.goals.presentation.dto.UpdateGoalRequestDTO;
import com.moneywise.goals.presentation.websocket.GoalWebSocketPublisher;
import com.moneywise.shared.web.CurrentUserId;
import com.moneywise.shared.web.ErrorResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
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
    private final RegisterContribution registerContribution;
    private final ListGoals listGoals;
    private final GetGoal getGoal;
    private final GetContributionHistory getContributionHistory;
    private final UpdateGoal updateGoal;
    private final ArchiveGoal archiveGoal;
    private final DeleteGoal deleteGoal;
    private final GoalWebSocketPublisher goalWebSocketPublisher;

    public GoalController(CreateGoal createGoal, GetGoalThermometer getGoalThermometer,
            RegisterContribution registerContribution, ListGoals listGoals, GetGoal getGoal,
            GetContributionHistory getContributionHistory, UpdateGoal updateGoal, ArchiveGoal archiveGoal,
            DeleteGoal deleteGoal, GoalWebSocketPublisher goalWebSocketPublisher) {
        this.createGoal = createGoal;
        this.getGoalThermometer = getGoalThermometer;
        this.registerContribution = registerContribution;
        this.listGoals = listGoals;
        this.getGoal = getGoal;
        this.getContributionHistory = getContributionHistory;
        this.updateGoal = updateGoal;
        this.archiveGoal = archiveGoal;
        this.deleteGoal = deleteGoal;
        this.goalWebSocketPublisher = goalWebSocketPublisher;
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

    @PostMapping("/goals/{id}/contributions")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Registrar movimento na Caixinha",
            description = """
                    Registra uma entrada (aporte) ou uma retirada na meta (RF-13, L-07). Qualquer membro do grupo \
                    pode movimentar. O valor é na moeda da meta. Uma retirada maior que o valor acumulado é \
                    recusada e o acumulado nunca fica negativo. A resposta é o novo estado do Termômetro, no mesmo \
                    formato de GET /goals/{id}/thermometer (RF-17). O id é gerado no app: o reenvio com o mesmo id \
                    não registra de novo e devolve o Termômetro atual, também com 201 (seção 6.4). \
                    Nenhum saldo pessoal é retornado: só os movimentos das Caixinhas são visíveis ao grupo (RN02/RN08). \
                    O mesmo Termômetro é publicado em /topic/goals/{id} para os membros inscritos (RF-19).""")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Movimento registrado (ou já existente, no reenvio)",
                    content = @Content(schema = @Schema(implementation = ThermometerResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos (ex.: valor zero ou negativo, tipo ausente)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Meta não encontrada, de um grupo do qual não é membro, "
                    + "ou id de movimento de outra meta",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Retirada maior que o acumulado "
                    + "(GOAL_INSUFFICIENT_BALANCE) ou meta arquivada (GOAL_ARCHIVED)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ThermometerResponseDTO registerContribution(@PathVariable UUID id,
            @Valid @RequestBody CreateContributionRequestDTO request, @CurrentUserId UUID userId) {
        var command = new RegisterContributionCommand(request.id(), id, userId, request.type(), request.amount());
        ThermometerResponseDTO thermometer = ThermometerResponseDTO.from(registerContribution.execute(command));
        // Só chega aqui se o caso de uso terminou com sucesso (transação concluída); com erro, nada é publicado.
        goalWebSocketPublisher.publish(thermometer);
        return thermometer;
    }

    @GetMapping("/goals")
    @Operation(
            operationId = "listGoals",
            summary = "Listar metas",
            description = """
                    Lista as metas de todos os grupos de que o usuário é membro, incluindo a Caixinha individual \
                    (L-06), com o progresso de cada uma. Com groupId, lista só as daquele grupo. Por padrão lista \
                    só as metas ativas; archived=true lista as arquivadas. Ordenação: da mais antiga para a mais nova.""")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Metas do usuário",
                    content = @Content(array = @ArraySchema(
                            schema = @Schema(implementation = GoalSummaryResponseDTO.class)))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "groupId de um grupo do qual não é membro",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<GoalSummaryResponseDTO> list(
            @Parameter(description = "Filtro opcional: só as metas deste grupo")
            @RequestParam(required = false) UUID groupId,
            @Parameter(description = "false (padrão): metas ativas; true: metas arquivadas")
            @RequestParam(defaultValue = "false") boolean archived,
            @CurrentUserId UUID userId) {
        return listGoals.execute(userId, groupId, archived).stream().map(GoalSummaryResponseDTO::from).toList();
    }

    @GetMapping("/goals/{id}")
    @Operation(
            operationId = "getGoal",
            summary = "Detalhar meta",
            description = """
                    Dados da meta (nome, valor, prazo, ícone, categoria, lembrete, marcos, arquivada). O progresso \
                    e a soma por membro estão em GET /goals/{id}/thermometer. Só membros do grupo acessam.""")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Meta",
                    content = @Content(schema = @Schema(implementation = GoalResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Meta não encontrada ou de um grupo do qual não é membro",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public GoalResponseDTO detail(@PathVariable UUID id, @CurrentUserId UUID userId) {
        return GoalResponseDTO.from(getGoal.execute(id, userId));
    }

    @PutMapping("/goals/{id}")
    @Operation(
            operationId = "updateGoal",
            summary = "Editar meta",
            description = """
                    Substitui os dados editáveis da meta; campo opcional enviado como null é apagado (prazo null = \
                    meta sem prazo). Só o Admin edita (L-17): membro comum não altera o valor da meta nem os outros \
                    campos (RN04). A moeda não muda (AD-12). O prazo novo não pode estar no passado; um prazo que \
                    não mudou não é validado de novo. Meta arquivada precisa ser desarquivada antes.""")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Meta editada",
                    content = @Content(schema = @Schema(implementation = GoalResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos (ex.: valor da meta zero ou negativo)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Membro que não é Admin (L-17, RN04)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Meta não encontrada ou de um grupo do qual não é membro",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Prazo no passado (INVALID_GOAL_DEADLINE) ou meta "
                    + "arquivada (GOAL_ARCHIVED)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public GoalResponseDTO update(@PathVariable UUID id, @Valid @RequestBody UpdateGoalRequestDTO request,
            @CurrentUserId UUID userId) {
        var command = new UpdateGoalCommand(id, userId, request.name(), request.targetAmount(), request.deadline(),
                request.icon(), request.category(), request.monthlyReminder(), request.milestonesEnabled());
        return GoalResponseDTO.from(updateGoal.execute(command));
    }

    @GetMapping("/goals/{id}/contributions")
    @Operation(
            operationId = "listGoalContributions",
            summary = "Histórico de movimentos",
            description = """
                    Entradas e retiradas da meta, do mais novo para o mais antigo, com o nome de quem fez. \
                    Movimentos de contas excluídas aparecem sem autor (AD-15). Só membros do grupo acessam. \
                    A página começa em zero; o tamanho padrão é 20 e o máximo é 100.""")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página do histórico",
                    content = @Content(schema = @Schema(implementation = ContributionPageResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Paginação inválida",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Meta não encontrada ou de um grupo do qual não é membro",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> history(@PathVariable UUID id,
            @Parameter(description = "Índice da página, começando em zero", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Quantidade de itens por página (1 a 100)", example = "20")
            @RequestParam(defaultValue = "20") int size,
            @CurrentUserId UUID userId) {
        if (page < 0 || size < 1 || size > GetContributionHistory.MAX_PAGE_SIZE) {
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of("INVALID_PARAMETER", "Use page >= 0 e size entre 1 e 100."));
        }
        return ResponseEntity.ok(ContributionPageResponseDTO.from(
                getContributionHistory.execute(id, userId, page, size)));
    }

    @PostMapping("/goals/{id}/archive")
    @Operation(
            operationId = "archiveGoal",
            summary = "Arquivar meta",
            description = """
                    Arquiva a Caixinha: ela sai da lista padrão, mantém o histórico e o acumulado, e não aceita \
                    novos movimentos nem edição. Só o Admin (L-17). Arquivar uma meta já arquivada devolve a meta \
                    como está.""")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Meta arquivada",
                    content = @Content(schema = @Schema(implementation = GoalResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Membro que não é Admin (L-17)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Meta não encontrada ou de um grupo do qual não é membro",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public GoalResponseDTO archive(@PathVariable UUID id, @CurrentUserId UUID userId) {
        return GoalResponseDTO.from(archiveGoal.archive(id, userId));
    }

    @PostMapping("/goals/{id}/unarchive")
    @Operation(
            operationId = "unarchiveGoal",
            summary = "Desarquivar meta",
            description = "Volta a Caixinha para a lista de metas ativas. Só o Admin (L-17).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Meta ativa",
                    content = @Content(schema = @Schema(implementation = GoalResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Membro que não é Admin (L-17)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Meta não encontrada ou de um grupo do qual não é membro",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public GoalResponseDTO unarchive(@PathVariable UUID id, @CurrentUserId UUID userId) {
        return GoalResponseDTO.from(archiveGoal.unarchive(id, userId));
    }

    @DeleteMapping("/goals/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            operationId = "deleteGoal",
            summary = "Excluir meta",
            description = """
                    Exclui a Caixinha e todo o histórico de movimentos. Só o Admin (L-17) e só sem valor acumulado: \
                    com saldo, é preciso retirar o valor ou arquivar a meta.""")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Meta excluída"),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Membro que não é Admin (L-17)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Meta não encontrada ou de um grupo do qual não é membro",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Meta com valor acumulado (GOAL_HAS_BALANCE)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public void delete(@PathVariable UUID id, @CurrentUserId UUID userId) {
        deleteGoal.execute(id, userId);
    }
}