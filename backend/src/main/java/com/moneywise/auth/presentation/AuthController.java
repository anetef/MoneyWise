package com.moneywise.auth.presentation;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.moneywise.auth.application.usecase.Login;
import com.moneywise.auth.application.usecase.LoginCommand;
import com.moneywise.auth.application.usecase.RegisterUser;
import com.moneywise.auth.application.usecase.RegisterUserCommand;
import com.moneywise.auth.presentation.dto.LoginRequestDTO;
import com.moneywise.auth.presentation.dto.LoginResponseDTO;
import com.moneywise.auth.presentation.dto.RegisterRequestDTO;
import com.moneywise.auth.presentation.dto.UserResponseDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/** Endpoints públicos de autenticação . O prefixo /api/v1 vem da ApiVersioningConfiguration. */
@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticação", description = "Cadastro e login")
public class AuthController {

    private final RegisterUser registerUser;
    private final Login login;

    public AuthController(RegisterUser registerUser, Login login) {
        this.registerUser = registerUser;
        this.login = login;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Cadastrar usuário",
            description = """
                    Cria o usuário com o e-mail **não confirmado** e devolve os dados dele, **sem tokens**.
                    O app deve levar o usuário para a confirmação do e-mail; o login só é liberado depois dela.

                    Erros: 400 (campos inválidos), 409 `EMAIL_ALREADY_IN_USE` (e-mail já cadastrado),
                    422 `INVALID_CURRENCY` (moeda inexistente).
                    """)
    public UserResponseDTO register(@Valid @RequestBody RegisterRequestDTO request) {
        RegisterUserCommand command = new RegisterUserCommand(
                request.name(), request.email(), request.password(), request.currency());
        return UserResponseDTO.from(registerUser.execute(command));
    }

    @PostMapping("/login")
    @Operation(
            summary = "Login",
            description = """
                    Valida e-mail e senha e devolve o access token, o refresh token e os dados do usuário.

                    Erros: 400 (campos vazios), 401 `INVALID_CREDENTIALS` (e-mail inexistente ou senha errada,
                    sempre com a mesma mensagem), 403 `EMAIL_NOT_VERIFIED` (senha certa, e-mail não confirmado).
                    """)
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO request) {
        return LoginResponseDTO.from(login.execute(new LoginCommand(request.email(), request.password())));
    }
}