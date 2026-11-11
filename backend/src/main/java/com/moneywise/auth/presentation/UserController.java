
package com.moneywise.auth.presentation;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moneywise.auth.application.usecase.profile.GetCurrentUser;
import com.moneywise.auth.presentation.dto.UserResponseDTO;
import com.moneywise.shared.web.CurrentUserId;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/users")
@Tag(name = "Usuários")
@SecurityRequirement(name = "BearerAuth")
public class UserController {

    private final GetCurrentUser getCurrentUser;

    public UserController(GetCurrentUser getCurrentUser) {
        this.getCurrentUser = getCurrentUser;
    }

    @GetMapping("/me")
    @Operation(
        operationId = "getCurrentUser",
        summary = "Consultar usuário autenticado",
        description = "Retorna os dados da conta identificada pelo JWT."
    )
    public UserResponseDTO me(@CurrentUserId UUID userId) {
        return UserResponseDTO.from(
                getCurrentUser.execute(userId)
        );
    }
}
