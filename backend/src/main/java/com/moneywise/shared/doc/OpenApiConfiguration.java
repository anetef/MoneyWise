package com.moneywise.shared.doc;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "MoneyWise API",
                version = "1.0.0",
                description = """
                        API REST do MoneyWise.

                        ## Formato de erro
                        Todo erro segue o formato `ErrorResponse`:
                        `code` (identificador estável para o app), `message` (texto em português)
                        e `fields` (campos inválidos; vazio quando não se aplica).

                        | Status | Quando |
                        |---|---|
                        | 400 | Dados inválidos (Bean Validation) ou requisição mal formatada |
                        | 403 | O usuário não tem permissão para a operação |
                        | 404 | Recurso não encontrado |
                        | 409 | Conflito, como e-mail já cadastrado |
                        | 422 | Regra de negócio violada, como alterar transação de mês fechado |
                        | 500 | Erro inesperado no servidor |

                        O 422 é usado quando a requisição está bem formada, mas viola uma regra de
                        negócio (RN). O 400 fica reservado para dados mal formados ou inválidos.
                        """
                ))
@SecurityScheme(
        name = "BearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Autenticação por token JWT Bearer.")
public class OpenApiConfiguration {
}
