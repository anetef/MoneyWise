package com.moneywise.auth.presentation;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.moneywise.auth.application.usecase.Login;
import com.moneywise.auth.application.usecase.LoginCommand;
import com.moneywise.auth.application.usecase.Logout;
import com.moneywise.auth.application.usecase.RefreshAccessToken;
import com.moneywise.auth.application.usecase.RegisterUser;
import com.moneywise.auth.application.usecase.RegisterUserCommand;
import com.moneywise.auth.application.usecase.ResendVerificationCode;
import com.moneywise.auth.application.usecase.VerifyEmail;
import com.moneywise.auth.application.usecase.VerifyEmailCommand;
import com.moneywise.auth.presentation.dto.LoginRequestDTO;
import com.moneywise.auth.presentation.dto.LoginResponseDTO;
import com.moneywise.auth.presentation.dto.RefreshTokenRequestDTO;
import com.moneywise.auth.presentation.dto.RegisterRequestDTO;
import com.moneywise.auth.presentation.dto.ResendVerificationRequestDTO;
import com.moneywise.auth.presentation.dto.TokenResponseDTO;
import com.moneywise.auth.presentation.dto.UserResponseDTO;
import com.moneywise.auth.presentation.dto.VerifyEmailRequestDTO;

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
    private final VerifyEmail verifyEmail;
    private final ResendVerificationCode resendVerificationCode;
     private final RefreshAccessToken refreshAccessToken;
    private final Logout logout;

    public AuthController(RegisterUser registerUser, Login login,
                          VerifyEmail verifyEmail, ResendVerificationCode resendVerificationCode,
                          RefreshAccessToken refreshAccessToken, Logout logout) {
        this.registerUser = registerUser;
        this.login = login;
        this.verifyEmail = verifyEmail;
        this.resendVerificationCode = resendVerificationCode;
        this.refreshAccessToken = refreshAccessToken;
        this.logout = logout;
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

        @PostMapping("/verify-email")
    @Operation(
            summary = "Confirmar e-mail",
            description = """
                    Confere o código de 6 dígitos enviado por e-mail no cadastro. Se estiver certo, confirma o e-mail
                    e já devolve os tokens e os dados do usuário, no mesmo formato do login.

                    Erros: 400 (campos inválidos), 409 `EMAIL_ALREADY_VERIFIED`,
                    422 `INVALID_VERIFICATION_CODE` (código errado, ou e-mail sem código pendente),
                    422 `VERIFICATION_CODE_EXPIRED` (passou de 15 minutos),
                    422 `VERIFICATION_ATTEMPTS_EXCEEDED` (5 tentativas erradas; peça um novo código).
                    """)
    public LoginResponseDTO verifyEmail(@Valid @RequestBody VerifyEmailRequestDTO request) {
        return LoginResponseDTO.from(verifyEmail.execute(new VerifyEmailCommand(request.email(), request.code())));
    }

    @PostMapping("/resend-verification")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Reenviar código de confirmação",
            description = """
                    Gera um novo código e envia por e-mail. O código anterior deixa de valer.
                    Responde 204 também quando o e-mail não existe ou já foi confirmado, para não revelar
                    quais e-mails têm conta.

                    Erros: 400 (e-mail inválido), 429 `VERIFICATION_RESEND_TOO_SOON` (menos de 1 minuto desde o último envio).
                    """)
    public void resendVerification(@Valid @RequestBody ResendVerificationRequestDTO request) {
        resendVerificationCode.execute(request.email());
    }

        @PostMapping("/refresh")
    @Operation(
            summary = "Renovar access token",
            description = """
                    Troca um refresh token válido por um novo access token **e** um novo refresh token (rotação, L-01).
                    O refresh token enviado deixa de valer; o app deve guardar o novo.

                    Erros: 400 (campo vazio), 401 `INVALID_REFRESH_TOKEN` (token inválido, vencido ou revogado:
                    o app deve mandar o usuário para o login).
                    """)
    public TokenResponseDTO refresh(@Valid @RequestBody RefreshTokenRequestDTO request) {
        return TokenResponseDTO.from(refreshAccessToken.execute(request.refreshToken()));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Logout",
            description = """
                    Revoga o refresh token informado: depois disso, ele não gera novos access tokens.
                    Responde 204 mesmo se o token já estiver revogado ou não existir.
                    O access token atual continua válido até vencer (no máximo 15 min); o app deve apagar os dois.

                    Erros: 400 (campo vazio).
                    """)
    public void logout(@Valid @RequestBody RefreshTokenRequestDTO request) {
        logout.execute(request.refreshToken());
    }
}