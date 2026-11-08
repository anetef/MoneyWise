package com.moneywise.groups.presentation;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moneywise.groups.application.usecase.invitations.AcceptGroupInvitation;
import com.moneywise.groups.application.usecase.invitations.GetInvitationPreview;
import com.moneywise.groups.presentation.dto.GroupResponseDTO;
import com.moneywise.groups.presentation.dto.InvitationPreviewResponseDTO;
import com.moneywise.shared.web.CurrentUserId;
import com.moneywise.shared.web.ErrorResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

/** Endpoints autenticados para quem recebeu um código de convite: consultar e aceitar (L-05). */
@RestController
@RequestMapping("/invitations")
@Tag(name = "Grupos", description = "Grupos e Caixinhas do usuário autenticado, membros e convites")
@SecurityRequirement(name = "BearerAuth")
public class GroupInvitationController {

    private final GetInvitationPreview getInvitationPreview;
    private final AcceptGroupInvitation acceptGroupInvitation;

    public GroupInvitationController(GetInvitationPreview getInvitationPreview,
            AcceptGroupInvitation acceptGroupInvitation) {
        this.getInvitationPreview = getInvitationPreview;
        this.acceptGroupInvitation = acceptGroupInvitation;
    }

    @GetMapping("/{code}")
    @Operation(operationId = "getGroupInvitation", summary = "Consultar convite",
            description = "Mostra o nome do grupo, quem convidou, a quantidade de membros e a validade, antes do "
                    + "aceite. Não expõe a lista de membros nem dados financeiros.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Convite válido",
                    content = @Content(schema = @Schema(implementation = InvitationPreviewResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Convite não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Convite expirado ou já aceito",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public InvitationPreviewResponseDTO get(@PathVariable String code, @CurrentUserId UUID userId) {
        return InvitationPreviewResponseDTO.from(getInvitationPreview.execute(code, userId));
    }

    @PostMapping("/{code}/accept")
    @Operation(operationId = "acceptGroupInvitation", summary = "Aceitar convite",
            description = "Inclui o usuário autenticado como membro do grupo. O convite é de uso único e vale 7 "
                    + "dias. Quem já participa do grupo recebe o grupo, sem duplicar o membro, e o convite "
                    + "continua disponível para outra pessoa.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário é membro do grupo",
                    content = @Content(schema = @Schema(implementation = GroupResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Convite não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Convite expirado ou já aceito",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public GroupResponseDTO accept(@PathVariable String code, @CurrentUserId UUID userId) {
        return GroupResponseDTO.from(acceptGroupInvitation.execute(code, userId));
    }
}
