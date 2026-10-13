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

## Migrations (Flyway)

O esquema do banco é criado e alterado **somente** pelo Flyway. O Hibernate roda com
`ddl-auto: validate`: ele apenas confere se as entidades batem com as tabelas e nunca
cria nem altera nada.

As migrations ficam em `src/main/resources/db/migration/` e rodam automaticamente
quando a API sobe. O Flyway registra as que já foram aplicadas na tabela
`flyway_schema_history`.

### Nome dos arquivos

    V<número>__<descrição>.sql

- `V` maiúsculo, seguido de um número inteiro sequencial: `V1`, `V2`, `V3`...
- **Dois** sublinhados entre o número e a descrição.
- Descrição em inglês, `snake_case`, começando por um verbo: `create_users`,
  `add_currency_to_users`, `create_index_transactions_date`.

Exemplo: `V1__create_users.sql`.

### Regras

1. **Migration aplicada nunca é editada.** O Flyway guarda um checksum de cada arquivo
   e recusa subir a API se um arquivo já aplicado mudar. Para corrigir algo, crie uma
   migration nova.
2. **Uma mudança por migration.** Uma tabela, ou uma alteração coesa, por arquivo.
3. **Reserve o número antes de começar.** Ao pegar uma tarefa que cria migration,
   anote o número na tabela abaixo (no mesmo PR, ou combinando no grupo da equipe).
   Assim, tarefas em paralelo não usam o mesmo número.
4. **Conflito de número:** se, ao atualizar a sua branch com a `develop`, já existir
   uma migration com o seu número, **renumere a sua** para o próximo número livre
   antes de abrir ou mergear o PR. Isso só é seguro porque a sua migration ainda não
   foi aplicada em nenhum banco compartilhado.
5. Depois de criar ou renumerar, suba a API localmente e confira no log que a
   migration foi aplicada (`Successfully applied 1 migration`).

### Números reservados

| Versão | Tarefa | Descrição |
|---|---|---|
| V1 | DB-02 / SEC-01 | `create_users` |
| V2 | | |
| V3 | | |

### Começar com o banco limpo

Para apagar o banco local e reaplicar todas as migrations do zero (na raiz do projeto):

    docker compose down -v
    docker compose up -d

**Atenção:** o `-v` apaga todos os dados do banco local.

6. **Toda tabela tem `created_at` e `updated_at`** (decisão L-08):
   `TIMESTAMPTZ NOT NULL DEFAULT now()`. Na entidade JPA, são preenchidas com
   `@CreationTimestamp` e `@UpdateTimestamp`.
   
 ## Testes

    ./mvnw clean verify

Os testes de integração usam **Testcontainers** (decisão L-15): sobem um PostgreSQL 17
temporário no Docker, aplicam as migrations do Flyway e o descartam no final.
O banco de desenvolvimento não é usado nem alterado.

**O Docker precisa estar rodando** para executar os testes.

Para um novo teste de integração, use `@SpringBootTest` com
`@Import(TestcontainersConfiguration.class)`.