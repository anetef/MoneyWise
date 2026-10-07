# API do MoneyWise

## OpenAPI e Swagger UI

Com o perfil `dev` ativo, a interface Swagger UI fica disponível em
`http://localhost:8080/swagger-ui/index.html` e o contrato JSON em
`http://localhost:8080/v3/api-docs`. A definição de segurança `BearerAuth`
permite informar um JWT pelo botão **Authorize**.

Os controllers anotados com `@RestController` nos pacotes `com.moneywise.*`
recebem automaticamente o prefixo `/api/v1`. Mapeamentos de WebSocket são
registrados separadamente e continuam usando `/ws`.

### Atualizar o contrato versionado

Suba a API no perfil `dev` com o PostgreSQL disponível e, a partir da pasta
`backend`, execute:

```powershell
Invoke-WebRequest -Uri http://localhost:8080/v3/api-docs.yaml -OutFile ../docs/api/openapi.yaml
```

O arquivo `docs/api/openapi.yaml` é o contrato versionado consumido pelo app
móvel. Execute esse comando novamente após alterar ou adicionar endpoints REST.
