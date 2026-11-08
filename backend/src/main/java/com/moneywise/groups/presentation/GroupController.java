package com.moneywise.groups.presentation;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.moneywise.groups.application.usecase.create.CreateGroup;
import com.moneywise.groups.application.usecase.create.CreateGroupCommand;
import com.moneywise.groups.application.usecase.invitations.CreateGroupInvitation;
import com.moneywise.groups.application.usecase.members.LeaveGroup;
import com.moneywise.groups.application.usecase.members.RemoveGroupMember;
import com.moneywise.groups.application.usecase.query.GetGroup;
import com.moneywise.groups.application.usecase.query.ListGroups;
import com.moneywise.groups.presentation.dto.CreateGroupRequestDTO;
import com.moneywise.groups.presentation.dto.GroupInvitationResponseDTO;
import com.moneywise.groups.presentation.dto.GroupResponseDTO;
import com.moneywise.shared.web.CurrentUserId;
import com.moneywise.shared.web.ErrorResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/** Endpoints autenticados de grupos e Caixinhas: criar, consultar, remover membro, sair e convidar. */
@RestController
@RequestMapping("/groups")
@Tag(name = "Grupos", description = "Grupos e Caixinhas do usuário autenticado, membros e convites")
@SecurityRequirement(name = "BearerAuth")
public class GroupController {

    private final CreateGroup createGroup;
    private final ListGroups listGroups;
    private final GetGroup getGroup;
    private final RemoveGroupMember removeGroupMember;
    private final LeaveGroup leaveGroup;
    private final CreateGroupInvitation createGroupInvitation;

    public GroupController(CreateGroup createGroup, ListGroups listGroups, GetGroup getGroup,
            RemoveGroupMember removeGroupMember, LeaveGroup leaveGroup,
            CreateGroupInvitation createGroupInvitation) {
        this.createGroup = createGroup;
        this.listGroups = listGroups;
        this.getGroup = getGroup;
        this.removeGroupMember = removeGroupMember;
        this.leaveGroup = leaveGroup;
        this.createGroupInvitation = createGroupInvitation;
    }

    @PostMapping
    @Operation(operationId = "createGroup", summary = "Criar grupo",
            description = "Cria um grupo com ID do cliente; o usuário autenticado vira o Admin. Reenvio do mesmo "
                    + "ID por quem já participa do grupo devolve o grupo existente, sem duplicar. ID de grupo de "
                    + "que o usuário não participa responde 404.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Grupo criado (ou já existente, no reenvio)",
                    content = @Content(schema = @Schema(implementation = GroupResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado ou ID pertence a outro grupo",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Nome do grupo inválido",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<GroupResponseDTO> create(@Valid @RequestBody CreateGroupRequestDTO request,
            @CurrentUserId UUID userId) {
        var command = new CreateGroupCommand(request.id(), userId, request.name());
        GroupResponseDTO response = GroupResponseDTO.from(createGroup.execute(command));
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(URI.create("/api/v1/groups/" + response.id()))
                .body(response);
    }

    @GetMapping
    @Operation(operationId = "listGroups", summary = "Listar grupos",
            description = "Lista apenas os grupos e Caixinhas de que o usuário autenticado participa, do mais "
                    + "antigo para o mais recente, com os membros de cada um.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Grupos do usuário",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = GroupResponseDTO.class)))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<GroupResponseDTO> list(@CurrentUserId UUID userId) {
        return listGroups.execute(userId).stream().map(GroupResponseDTO::from).toList();
    }

    @GetMapping("/{id}")
    @Operation(operationId = "getGroup", summary = "Detalhar grupo",
            description = "Detalha um grupo e seus membros. Quem não participa do grupo recebe 404.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Grupo encontrado",
                    content = @Content(schema = @Schema(implementation = GroupResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Grupo não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public GroupResponseDTO get(@PathVariable UUID id, @CurrentUserId UUID userId) {
        return GroupResponseDTO.from(getGroup.execute(id, userId));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(operationId = "removeGroupMember", summary = "Remover membro",
            description = "Somente o Admin remove membros (RN04). Se o Admin remover a si mesmo, o membro mais "
                    + "antigo vira Admin (L-10). O removido perde o acesso ao grupo e às suas metas.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Membro removido"),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Usuário não é o Admin do grupo",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Grupo ou membro não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "O Admin é o único membro do grupo",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public void removeMember(@PathVariable UUID id, @PathVariable UUID memberId, @CurrentUserId UUID userId) {
        removeGroupMember.execute(id, userId, memberId);
    }

    @DeleteMapping("/{id}/members/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(operationId = "leaveGroup", summary = "Sair do grupo",
            description = "O usuário autenticado sai do grupo (L-09). Se for o Admin, o membro mais antigo vira "
                    + "Admin (L-10). O único membro do grupo não pode sair.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Usuário saiu do grupo"),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Grupo não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Usuário é o único membro do grupo",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public void leave(@PathVariable UUID id, @CurrentUserId UUID userId) {
        leaveGroup.execute(id, userId);
    }

    @PostMapping("/{id}/invitations")
    @Operation(operationId = "createGroupInvitation", summary = "Gerar convite",
            description = "Gera um código de convite de uso único, válido por 7 dias (L-05). Somente o Admin "
                    + "convida (L-10).")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Convite gerado",
                    content = @Content(schema = @Schema(implementation = GroupInvitationResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Usuário não é o Admin do grupo",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Grupo não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<GroupInvitationResponseDTO> invite(@PathVariable UUID id, @CurrentUserId UUID userId) {
        GroupInvitationResponseDTO response = GroupInvitationResponseDTO.from(
                createGroupInvitation.execute(id, userId));
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(URI.create("/api/v1/invitations/" + response.code()))
                .body(response);
    }
}
