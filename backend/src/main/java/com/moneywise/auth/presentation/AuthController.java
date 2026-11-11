package com.moneywise.auth.presentation;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.moneywise.auth.application.usecase.login.Login;
import com.moneywise.auth.application.usecase.login.LoginCommand;
import com.moneywise.auth.application.usecase.passwordreset.RequestPasswordReset;
import com.moneywise.auth.application.usecase.passwordreset.ResetPassword;
import com.moneywise.auth.application.usecase.passwordreset.ResetPasswordCommand;
import com.moneywise.auth.application.usecase.passwordreset.VerifyPasswordResetCode;
import com.moneywise.auth.application.usecase.register.RegisterUser;
import com.moneywise.auth.application.usecase.register.RegisterUserCommand;
import com.moneywise.auth.application.usecase.session.Logout;
import com.moneywise.auth.application.usecase.session.RefreshAccessToken;
import com.moneywise.auth.application.usecase.verification.ResendVerificationCode;
import com.moneywise.auth.application.usecase.verification.VerifyEmail;
import com.moneywise.auth.application.usecase.verification.VerifyEmailCommand;
import com.moneywise.auth.presentation.dto.ForgotPasswordRequestDTO;
import com.moneywise.auth.presentation.dto.LoginRequestDTO;
import com.moneywise.auth.presentation.dto.LoginResponseDTO;
import com.moneywise.auth.presentation.dto.RefreshTokenRequestDTO;
import com.moneywise.auth.presentation.dto.RegisterRequestDTO;
import com.moneywise.auth.presentation.dto.ResendVerificationRequestDTO;
import com.moneywise.auth.presentation.dto.ResetPasswordRequestDTO;
import com.moneywise.auth.presentation.dto.TokenResponseDTO;
import com.moneywise.auth.presentation.dto.UserResponseDTO;
import com.moneywise.auth.presentation.dto.VerifyEmailRequestDTO;
import com.moneywise.auth.presentation.dto.VerifyResetCodeRequestDTO;

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
    private final RequestPasswordReset requestPasswordReset;
    private final VerifyPasswordResetCode verifyPasswordResetCode;
    private final ResetPassword resetPassword;

    public AuthController(RegisterUser registerUser, Login login,
                          VerifyEmail verifyEmail, 
                          ResendVerificationCode resendVerificationCode,
                          RefreshAccessToken refreshAccessToken, 
                          Logout logout,
                          RequestPasswordReset requestPasswordReset,
                          VerifyPasswordResetCode verifyPasswordResetCode,
                          ResetPassword resetPassword) {
        this.registerUser = registerUser;
        this.login = login;
        this.verifyEmail = verifyEmail;
        this.resendVerificationCode = resendVerificationCode;
        this.refreshAccessToken = refreshAccessToken;
        this.logout = logout;
        this.requestPasswordReset = requestPasswordReset;
        this.verifyPasswordResetCode = verifyPasswordResetCode;
        this.resetPassword = resetPassword;
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

    @PostMapping("/password/forgot")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Esqueci a senha",
            description = """
                    Se o e-mail tiver conta, gera um código de 6 dígitos válido por 15 minutos e envia por e-mail.
                    Responde 204 também quando o e-mail não tem conta, para não revelar quais e-mails estão
                    cadastrados. Um novo pedido em menos de 1 minuto é ignorado (também com 204); o app deve
                    deixar o botão de reenviar desativado durante esse minuto.

                    Erros: 400 (e-mail inválido).
                    """)
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        requestPasswordReset.execute(request.email());
    }

    @PostMapping("/password/verify-code")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Conferir código de recuperação",
            description = """
                    Confere o código na tela "confirmar código", antes da tela de nova senha. Não troca a senha
                    nem gasta o código: o app guarda o código e o envia de novo em /password/reset.

                    Erros: 400 (campos inválidos), 422 `INVALID_RESET_CODE` (código errado, vencido, já usado,
                    5 tentativas erradas, ou e-mail sem conta; peça um novo código).
                    """)
    public void verifyResetCode(@Valid @RequestBody VerifyResetCodeRequestDTO request) {
        verifyPasswordResetCode.execute(request.email(), request.code());
    }

    @PostMapping("/password/reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Cadastrar nova senha",
            description = """
                    Confere o código de novo e troca a senha (mesmas regras do cadastro). O código passa a valer
                    como usado, o e-mail fica confirmado e todas as sessões abertas caem: os refresh tokens antigos
                    passam a receber 401 em /auth/refresh. Não faz login: o app leva o usuário para a tela de login.

                    Erros: 400 (campos inválidos, senha fora de 8 a 72 caracteres),
                    422 `INVALID_RESET_CODE` (código errado, vencido, já usado, 5 tentativas erradas, ou e-mail sem conta).
                    """)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        resetPassword.execute(new ResetPasswordCommand(request.email(), request.code(), request.newPassword()));
    }
}