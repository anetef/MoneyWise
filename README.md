# Plano de alteração das issues (pronto para copiar e colar)

Data: 30/09/2026 · Repositório: anetef/MoneyWise · **Nada foi alterado no GitHub.**

**Base:** o diagnóstico aprovado. É o arquivo [revisao-backlog-arquitetura-v2.md](revisao-backlog-arquitetura-v2.md) com as correções da segunda passada ([revisao-backlog-v2-segunda-passada.md](revisao-backlog-v2-segunda-passada.md)), que conferiu cada ponto no documento. Onde as duas divergem, vale a segunda passada (ex.: a porta 8080 fica como está, MTX-04 não depende de REP-01, TX-06/GOAL-03/MGO-04 não recebem `blocked:gap`). Fonte de verdade: `MoneyWise_Arquitetura_v2.0.docx`, que não é alterado.

**Como usar:** em cada issue, "Substituir" indica o trecho atual exato e "Por" o texto novo. Quando os critérios de aceite mudam, o bloco "Critérios de aceite revisados" traz a lista **completa**, para substituir a lista inteira que fica sob "**Critérios de aceitação:**" (mantendo a indentação de dois espaços usada nas issues). Os trechos de "Substituir" foram conferidos contra o texto atual das issues no GitHub. O rodapé das issues ("Fonte: backlog MoneyWise...") não muda.

**Totais:** 45 tasks e 11 lacunas com alteração. As 46 tasks e 10 lacunas adequadas não aparecem aqui (lista no fim). Nenhuma lacuna é mesclada. Nenhuma issue nova é criada; há **uma** proposta de issue nova (bloco E, N7), só para avaliação.

Legenda: **Decisão pendente** = depende de uma decisão humana; o texto não inventa a solução.

---

## A. Issues com mudança técnica (20)

### #28 [BE-01] Projeto Spring Boot base
**O que está errado ou incompleto:** o `shared` aparece com o molde de 4 camadas, mas a seção 5.4.1 reserva esse molde para as funcionalidades. As versões de Java e Spring Boot (L-13) precisam estar decididas antes de começar. A porta 8080 está correta (Figura 11) e não muda.
**Depende de:** sem alteração.
**Labels:** sem alteração.

Substituir:
```
- **Depende de:** INF-01 · **Decisão pendente:** L-13 (versões de Java e Spring Boot)
```
Por:
```
- **Depende de:** INF-01 · **Decisão pendente (decidir antes de iniciar):** L-13, parte "versões de Java e Spring Boot"
```
Critérios de aceite revisados:
```
- [ ] `./mvnw spring-boot:run` (ou `mvn`) sobe a aplicação na porta 8080 (seção 7).
- [ ] Pastas vazias por funcionalidade criadas conforme a seção 5.4.1 (`auth`, `transactions`, `groups`, `goals`, `reports`, `notifications`), cada uma com `domain/application/infrastructure/presentation`.
- [ ] Pacote `shared` criado sem o molde de 4 camadas, para config, exceções, `Money` e error handler (seção 5.4.1).
- [ ] Versões de Java e Spring Boot conforme a decisão registrada na L-13.
- [ ] Nenhuma credencial fixa no `application.yml`.
```

### #29 [MOB-01] Projeto Expo + TypeScript com a estrutura MVVM
**O que está errado ou incompleto:** não impede o Expo Router, que AD-09 rejeitou (o template padrão do Expo usa Expo Router). Não fixa o Android mínimo. Não configura o runner de testes, que MOB-03, MOB-05 e MOB-06 exigem. A regra de lint "core não importa features" não prevê `core/navigation` (N1).
**Depende de:** sem alteração.
**Labels:** sem alteração.

Substituir:
```
- **Depende de:** INF-01
```
Por:
```
- **Depende de:** INF-01 · **Decisão pendente:** L-13 (framework de testes do mobile), N1 (regra de lint para `core/navigation`)
```
Acrescentar ao fim da **Descrição**:
```
A navegação usa React Navigation (AD-09); o projeto não deve usar Expo Router.
```
Critérios de aceite revisados:
```
- [ ] `npx expo start` abre o app em Android e iOS (Expo Go ou emulador).
- [ ] Projeto sem Expo Router; a navegação usa apenas React Navigation (AD-09).
- [ ] Versão mínima do Android configurada como Android 10 (seção 3 e seção 7).
- [ ] `npm run lint` e `npm run typecheck` passam.
- [ ] Uma importação proibida, feita localmente, gera erro no ESLint.
- [ ] Runner de testes configurado conforme a decisão da L-13, com um comando documentado que executa um teste de exemplo. (Decisão pendente: L-13.)
- [ ] O tratamento da regra "core não importa features" para `core/navigation` segue a decisão N1; até lá, a regra atual permanece. (Decisão pendente: N1.)
- [ ] A URL da API vem de variável de ambiente (`EXPO_PUBLIC_API_URL`), com `.env.example`.
```

### #32 [BE-04] Regras de arquitetura com ArchUnit
**O que está errado ou incompleto:** não diz se o `domain` pode usar o `shared` (TX-01 usa `Money`). Não trata o uso do serviço de autorização de grupos pelos casos de uso de metas (seção 6.3). Falta a regra "infrastructure não importa presentation" (seção 5.2).
**Depende de:** sem alteração.
**Labels:** sem alteração.

Substituir a **Descrição** inteira por:
```
- **Descrição:** criar testes ArchUnit (seção 8, Manutenibilidade) que garantam a regra de dependência da seção 5.2: `domain` não importa Spring, JPA nem outras camadas; `application` não importa `infrastructure` nem `presentation`; `presentation` não acessa `infrastructure` diretamente; `infrastructure` não importa `presentation`; `shared` não importa funcionalidades. O `domain` pode usar do `shared` apenas classes sem framework (ex.: `Money`, exceções de domínio). A `application` de `goals` pode usar o serviço de autorização de grupo da `application` de `groups` (seção 6.3).
```
Critérios de aceite revisados:
```
- [ ] Os testes rodam no build (`mvn test`).
- [ ] Uma violação proposital, feita localmente, faz o teste falhar.
- [ ] `domain` não importa Spring, JPA, `application`, `infrastructure` nem `presentation`.
- [ ] `domain` só usa do `shared` classes sem Spring/JPA (ex.: `Money`, exceções de domínio).
- [ ] `application` não importa `infrastructure` nem `presentation`.
- [ ] `presentation` não importa `infrastructure`.
- [ ] `infrastructure` não importa `presentation`.
- [ ] `shared` não importa funcionalidades.
- [ ] A `application` de `goals` pode usar o serviço de autorização de grupo da `application` de `groups` (seção 6.3), e a regra de dependência entre módulos fica documentada no teste.
```

### #35 [MOB-04] Navegação base (React Navigation)
**O que está errado ou incompleto:** `RootNavigator`/`AuthStack`/`MainTabs` ficam em `core/navigation` (seção 5.4.2) e precisam chegar às telas das features, mas a seção 5.3 diz que o core nunca importa de uma funcionalidade. A navegação **continua no core**; falta registrar a decisão N1.
**Depende de:** sem alteração.
**Labels:** sem alteração.

Substituir:
```
- **Depende de:** MOB-01
```
Por:
```
- **Depende de:** MOB-01 · **Decisão pendente:** N1 (como `core/navigation` referencia as telas das features; não bloqueia os placeholders desta task)
```
Critérios de aceite revisados:
```
- [ ] O `RootNavigator` decide entre `AuthStack` e `MainTabs` com base no estado de sessão (seção 4.2, "Sessão ativa?").
- [ ] Todas as rotas acima navegáveis por botões temporários.
- [ ] Parâmetros de rota tipados (ex.: `goalId`).
- [ ] `RootNavigator`, `AuthStack` e `MainTabs` ficam em `core/navigation` (seção 5.4.2).
- [ ] A forma como as telas reais das features entram no navegador segue a decisão N1, sem violar a regra de lint de MOB-01. (Decisão pendente: N1.)
```

### #42 [DB-04] Migration de transações
**O que está errado ou incompleto:** `updated_at` está condicionado à L-08, mas a seção 6.4 exige `updatedAt` para resolver conflitos. `description` e `created_at` continuam na L-08.
**Depende de:** sem alteração.
**Labels:** sem alteração.

Substituir:
```
- **Descrição:** criar `transactions` conforme o ER: `id uuid PK` (gerado no cliente, seção 6.4), `user_id FK`, `amount DECIMAL`, `date`, `category`, `type` (valores `INCOME`/`EXPENSE` com `CHECK`). Criar índice por `(user_id, date)` para os filtros de RF-08.
```
Por:
```
- **Descrição:** criar `transactions` conforme o ER: `id uuid PK` (gerado no cliente, seção 6.4), `user_id uuid FK`, `amount DECIMAL`, `date`, `category`, `type` (valores `INCOME`/`EXPENSE` com `CHECK`) e `updated_at timestamp`, exigido pela seção 6.4 ("prevalece a alteração mais recente"). Criar índice por `(user_id, date)` para os filtros de RF-08.
```
Critérios de aceite revisados:
```
- [ ] `amount` é `DECIMAL`/`NUMERIC` com precisão definida, nunca `float`.
- [ ] `type` só aceita os valores definidos.
- [ ] Índice por usuário e data criado.
- [ ] Coluna `updated_at` presente e `NOT NULL` (seção 6.4).
- [ ] Colunas `description` e `created_at` incluídas somente se aprovadas na L-08.
```

### #43 [DB-05] Migration de grupos e membros
**O que está errado ou incompleto:** não especifica o tipo das chaves. O ER (Figura 4) usa `uuid` em todas.
**Depende de:** sem alteração.
**Labels:** sem alteração.

Substituir:
```
- **Descrição:** criar `groups` (`id`, `name`, `admin_id FK users`) e `group_members` (`group_id FK`, `user_id FK`, `role` com `CHECK ('ADMIN','MEMBER')`), com constraint de unicidade `(group_id, user_id)` para impedir associação duplicada.
```
Por:
```
- **Descrição:** criar `groups` (`id uuid PK`, `name`, `admin_id uuid FK users`) e `group_members` (`group_id uuid FK`, `user_id uuid FK`, `role` com `CHECK ('ADMIN','MEMBER')`), com constraint de unicidade `(group_id, user_id)` para impedir associação duplicada.
```
Critérios de aceite revisados:
```
- [ ] Um usuário não entra duas vezes no mesmo grupo.
- [ ] `role` só aceita `ADMIN` ou `MEMBER`.
- [ ] Chaves primárias e estrangeiras do tipo `uuid` (ER, seção 3.1; seção 6.4).
- [ ] Tabela de convites criada **somente** se L-05 definir uma.
```

### #44 [DB-06] Migration de metas (Caixinhas) e aportes
**O que está errado ou incompleto:** não especifica o tipo das chaves. O ER usa `uuid`, e GOAL-04 exige `id` gerado no cliente.
**Depende de:** sem alteração.
**Labels:** sem alteração.

Substituir:
```
- **Descrição:** criar `goals` (`id`, `group_id FK`, `name`, `target_amount DECIMAL`, `deadline date`) e `contributions` (`id`, `goal_id FK`, `user_id FK`, `amount DECIMAL`, `created_at timestamp`).
```
Por:
```
- **Descrição:** criar `goals` (`id uuid PK`, `group_id uuid FK`, `name`, `target_amount DECIMAL`, `deadline date`) e `contributions` (`id uuid PK`, `goal_id uuid FK`, `user_id uuid FK`, `amount DECIMAL`, `created_at timestamp`).
```
Critérios de aceite revisados:
```
- [ ] FKs com integridade (não existe aporte sem meta nem meta sem grupo).
- [ ] `target_amount` e `amount` em `DECIMAL`.
- [ ] Chaves primárias e estrangeiras do tipo `uuid` (ER, seção 3.1; seção 6.4).
- [ ] Campos extras do Figma (ícone, categoria, sem prazo, lembretes, retirada) só entram após a decisão de L-06, L-07 e L-08.
```

### #48 [SEC-03] Hash de senha e serviço de tokens JWT
**O que está errado ou incompleto:** a emissão do refresh token depende da L-01, e SEC-04, SEC-05 e SEC-06 dependem desta issue. Sem separar access e refresh token, a L-01 trava todo o login.
**Depende de:** sem alteração.
**Labels:** sem alteração.

Substituir:
```
- **Depende de:** SEC-01 · **Decisão pendente:** L-01, L-13 (biblioteca JWT e tempos de expiração)
```
Por:
```
- **Depende de:** SEC-01 · **Decisão pendente:** L-01 (somente a parte B: refresh token), L-13 (biblioteca JWT)
```
Substituir a **Descrição** inteira por:
```
- **Descrição:** implementar em `auth/infrastructure/security`:
  - **Parte A:** `BCryptPasswordHasher`, que implementa `PasswordHasher`, e no `JwtTokenService` (que implementa `TokenService`) a emissão e validação do access token JWT de curta duração contendo o `userId` (AD-07). A chave de assinatura e a duração vêm de configuração/ambiente.
  - **Parte B:** a emissão e validação do refresh token no `JwtTokenService`, conforme a decisão da L-01 (armazenamento, duração e rotação).
  A parte A não depende da L-01 e é a única exigida por SEC-04.
```
Critérios de aceite revisados:
```
- [ ] (Parte A) A senha nunca é salva nem registrada em log em texto puro.
- [ ] (Parte A) Access tokens expirados, adulterados ou com assinatura errada são rejeitados (testes unitários).
- [ ] (Parte A) A duração do access token vem de configuração.
- [ ] (Parte A) O segredo do JWT não aparece no repositório.
- [ ] (Parte B) Refresh token emitido e validado conforme a L-01, com testes unitários. (Decisão pendente: L-01.)
```

### #49 [SEC-04] Configuração do Spring Security (stateless + filtro JWT)
**O que está errado ou incompleto:** não libera o Swagger em `dev`, que BE-03 exige. Não trata o `/ws`, cuja conexão exige JWT (seção 6.2, GOAL-07). A exceção de `/auth/refresh` não está explicada.
**Depende de:** adicionar **BE-03**.
**Labels:** sem alteração.

Substituir:
```
- **Depende de:** SEC-03, BE-02
```
Por:
```
- **Depende de:** SEC-03 (parte A), BE-02, BE-03
```
Acrescentar ao fim da **Descrição**:
```
Liberar as rotas do springdoc (Swagger UI e `/v3/api-docs`) somente no perfil `dev` (BE-03). O caminho `/ws` é tratado junto com GOAL-07: a conexão WebSocket exige o JWT (seção 6.2). `/auth/refresh` não exige access token porque é autenticado pelo refresh token (AD-07).
```
Critérios de aceite revisados:
```
- [ ] Qualquer rota protegida sem token → 401; token inválido ou expirado → 401.
- [ ] Rotas públicas (`/auth/register`, `/auth/login`, `/auth/refresh`) acessíveis sem access token.
- [ ] Swagger UI e `/v3/api-docs` acessíveis sem token apenas no perfil `dev`.
- [ ] O tratamento do caminho `/ws` é coerente com GOAL-07: o JWT é exigido na conexão WebSocket (seção 6.2).
- [ ] Os controllers não leem `userId` do corpo nem da URL para identificar o usuário logado.
- [ ] Testes de integração cobrindo os casos acima.
```

### #56 [TX-03] RegisterTransaction + `POST /api/v1/transactions` (idempotente)
**O que está errado ou incompleto:** a seção 6.1 e a Figura 9 dizem que `RegisterTransaction` valida a RN03, e a issue não tem esse critério. A regra exata para criação em mês fechado é a decisão N3 (relacionada à L-16, sem mesclar).
**Depende de:** sem alteração.
**Labels:** sem alteração.

Substituir:
```
- **Depende de:** TX-02, SEC-04
```
Por:
```
- **Depende de:** TX-02, SEC-04 · **Decisão pendente:** N3 (regra da RN03 para criação em mês fechado; relacionada à L-16)
```
Acrescentar ao fim da **Descrição**:
```
O caso de uso aplica a `MonthClosingPolicy` (RN03), conforme a seção 6.1.
```
Critérios de aceite revisados:
```
- [ ] Criação → 201. Reenvio com o mesmo `id` e o mesmo dono → sem duplicar, respondendo com o recurso existente (comportamento documentado no OpenAPI).
- [ ] Mesmo `id` enviado por outro usuário → rejeitado.
- [ ] `RegisterTransaction` aplica a `MonthClosingPolicy` (RN03, seção 6.1); a violação responde com o erro de regra de negócio de BE-02, que a fila do app trata como rejeitado (seção 6.4). A regra exata para criação em mês fechado segue a decisão N3. (Decisão pendente: N3.)
- [ ] Tempo de resposta compatível com RNF-01 (< 2 s) em ambiente local.
- [ ] Testes unitários e de integração.
```

### #58 [TX-05] UpdateTransaction + `PUT /api/v1/transactions/{id}`
**O que está errado ou incompleto:** cita "prevalece a alteração mais recente", mas nenhum critério testa o conflito. O `updated_at` passa a ser exigido pela seção 6.4 (DB-04) e deixa de ser uma decisão pendente aqui.
**Depende de:** sem alteração (DB-04 já vem via TX-02).
**Labels:** sem alteração.

Substituir:
```
- **Depende de:** TX-02, SEC-04 · **Decisão pendente:** L-08 (`updated_at` para conflito)
```
Por:
```
- **Depende de:** TX-02, SEC-04 · **Observação:** `updated_at` é exigido pela seção 6.4 e criado em DB-04
```
Critérios de aceite revisados:
```
- [ ] Transação de outro usuário → 404 (não revela que existe).
- [ ] Transação de mês fechado → erro de regra de negócio (código de BE-02).
- [ ] Edição com `updatedAt` mais antigo que o do registro atual não o sobrescreve; prevalece a alteração mais recente (seção 6.4).
- [ ] Testes cobrindo a edição válida e os três casos acima.
```

### #63 [GRP-03] CreateGroup + `POST /api/v1/groups`
**O que está errado ou incompleto:** não diz que o grupo usa UUID gerado no cliente e criação idempotente, como a seção 6.4 define para todos os registros. Possíveis exceções são a decisão N4, que não impede a implementação.
**Depende de:** sem alteração.
**Labels:** sem alteração.

Substituir:
```
- **Depende de:** GRP-02, SEC-04
```
Por:
```
- **Depende de:** GRP-02, SEC-04 · **Decisão pendente (não impede):** N4
```
Acrescentar ao fim da **Descrição**:
```
O `id` do grupo é um UUID gerado no cliente, e a criação é idempotente (seção 6.4).
```
Critérios de aceite revisados:
```
- [ ] Grupo criado → 201, e o criador aparece como ADMIN.
- [ ] Operação transacional (grupo e membro são gravados juntos ou nenhum dos dois).
- [ ] `id` UUID gerado no cliente; reenvio com o mesmo `id` pelo mesmo usuário não duplica o grupo (seção 6.4). Exceções a essa regra seguem a decisão N4.
```

### #66 [GRP-06] RemoveMember + `DELETE /api/v1/groups/{id}/members/{userId}`
**O que está errado ou incompleto:** "o Admin não pode remover a si mesmo" não consta da Arquitetura v2.0, que cita a RN04 sem descrever o conteúdo. "Somente o Admin" continua sustentado (seções 3 e 6.3).
**Depende de:** sem alteração.
**Labels:** sem alteração.

Substituir:
```
- **Depende de:** GRP-03
```
Por:
```
- **Depende de:** GRP-03 · **Decisão pendente:** N8 (Admin removendo a si mesmo)
```
Substituir:
```
- **Descrição:** remover um membro do grupo. **Somente o Admin** pode (RN04/RF-12), e o Admin não pode remover a si mesmo.
```
Por:
```
- **Descrição:** remover um membro do grupo. **Somente o Admin** pode (RN04/RF-12). **A confirmar (decisão pendente N8):** se o Admin pode remover a si mesmo; a regra não consta da Arquitetura v2.0 e deve ser verificada na RN04 do Documento de Visão v1.1.
```
Critérios de aceite revisados:
```
- [ ] Membro comum tentando remover → 403.
- [ ] Admin removendo membro → 204, e o removido perde acesso às metas do grupo.
- [ ] Comportamento do Admin removendo a si mesmo conforme a decisão N8, com teste. (Decisão pendente: N8.)
- [ ] Testes de integração.
```

### #67 [GOAL-01] Domínio de metas e ThermometerCalculator (RN01)
**O que está errado ou incompleto:** as faixas de status não estão na arquitetura (a seção 6.2 só define as entradas do cálculo). A issue dá exemplos de faixas que não têm fonte e manda "registrar a lacuna" sem que exista uma.
**Depende de:** sem alteração.
**Labels:** sem alteração.

Substituir:
```
- **Depende de:** BE-02
```
Por:
```
- **Depende de:** BE-02 · **Decisão pendente:** N2 (faixas e formato do status do Termômetro)
```
Acrescentar ao fim da **Descrição**:
```
As faixas e o formato do status seguem a decisão N2.
```
Critérios de aceite revisados:
```
- [ ] `ThermometerCalculatorTest` (seção 8) cobrindo: meta atingida, sem aportes, adiantada, atrasada e prazo vencido.
- [ ] As faixas e o formato do status retornado seguem a decisão N2 e ficam documentados. (Decisão pendente: N2.)
```

### #69 [GOAL-03] CreateGoal + `POST /api/v1/groups/{id}/goals`
**O que está errado ou incompleto:** endpoint protegido sem depender de SEC-04. Não diz que usa UUID do cliente (seção 6.4). A permissão (L-17) não aparece como critério. Não recebe `blocked:gap`, porque o bloqueio é parcial.
**Depende de:** adicionar **SEC-04**.
**Labels:** sem alteração.

Substituir:
```
- **Depende de:** GOAL-02, GRP-01 · **Decisão pendente:** L-17, L-06
```
Por:
```
- **Depende de:** GOAL-02, GRP-01, SEC-04 · **Decisão pendente:** L-17, L-06 · N4 (não impede)
```
Acrescentar ao fim da **Descrição**:
```
O `id` da meta é um UUID gerado no cliente, e a criação é idempotente (seção 6.4).
```
Critérios de aceite revisados:
```
- [ ] Não membro → negado.
- [ ] `target_amount` > 0.
- [ ] Permissão de criação conforme a decisão da L-17. (Decisão pendente: L-17.)
- [ ] `id` UUID gerado no cliente; reenvio com o mesmo `id` não duplica a meta (seção 6.4). Exceções seguem a decisão N4.
- [ ] Testes de integração.
```

### #70 [GOAL-04] RegisterContribution + `POST /api/v1/goals/{id}/contributions`
**O que está errado ou incompleto:** aponta a publicação para GOAL-07, mas ela é da GOAL-08. A Figura 10 mostra o caso de uso calculando o Termômetro e a resposta `201 + estado do Termômetro` (RF-17), e a issue não prevê isso. Endpoint protegido sem SEC-04.
**Depende de:** adicionar **SEC-04**.
**Labels:** sem alteração.

Substituir:
```
- **Depende de:** GOAL-02, GRP-01 · **Decisão pendente:** L-07
```
Por:
```
- **Depende de:** GOAL-02, GRP-01, SEC-04 · **Decisão pendente:** L-07
```
Substituir:
```
- **Integração:** API ↔ Mobile (MGO-05), API → WebSocket (GOAL-07).
```
Por:
```
- **Integração:** API ↔ Mobile (MGO-05), API → WebSocket (GOAL-08).
```
Acrescentar ao fim da **Descrição**:
```
O caso de uso calcula o novo estado do Termômetro com o `ThermometerCalculator` e a resposta é `201` com esse estado (Figura 10, RF-17).
```
Critérios de aceite revisados:
```
- [ ] Não membro → 403; valor ≤ 0 → erro de validação.
- [ ] Reenvio com o mesmo `id` não duplica.
- [ ] Resposta `201` com o estado atual do Termômetro, no formato documentado no OpenAPI e reutilizado por GOAL-05 e GOAL-08 (Figura 10, RF-17).
- [ ] Nenhum saldo pessoal é retornado ou exposto.
```

### #74 [GOAL-08] GoalWebSocketPublisher: publicação após aporte
**O que está errado ou incompleto:** não diz quem dispara a publicação. A Figura 10 mostra o `GoalController` (presentation) publicando depois que `RegisterContribution` retorna, então a application não depende da presentation. Falta a label de tempo real.
**Depende de:** sem alteração.
**Labels:** adicionar **`area:realtime`**; remover: nenhuma.

Substituir a **Descrição** inteira por:
```
- **Descrição:** depois que `RegisterContribution` retorna com sucesso (transação já concluída), o `GoalController` (presentation) chama o `GoalWebSocketPublisher`, que publica em `/topic/goals/{id}` o novo estado do Termômetro, no mesmo formato de `GET /goals/{id}/thermometer` (seção 6.2, Figura 10, passo 9). O caso de uso não conhece o publisher (seção 5.2).
```
Critérios de aceite revisados:
```
- [ ] Dois clientes inscritos recebem a atualização após um aporte (RF-19).
- [ ] Latência local < 2 s (RNF-01).
- [ ] Aporte com erro não publica nada.
- [ ] A publicação é feita pela presentation depois que o caso de uso retorna com sucesso; nenhuma classe da `application` depende do publisher (verificado pelo ArchUnit de BE-04).
- [ ] O payload publicado usa o schema do Termômetro documentado no OpenAPI.
```

### #102 [QA-01] Testes de integração de segurança e isolamento de dados
**O que está errado ou incompleto:** não cobre a autorização do WebSocket, que é requisito da seção 6.2.
**Depende de:** adicionar **GOAL-07**.
**Labels:** sem alteração.

Substituir:
```
- **Depende de:** TX-06, GRP-06, GOAL-05 · **Decisão pendente:** L-15
```
Por:
```
- **Depende de:** TX-06, GRP-06, GOAL-05, GOAL-07 · **Decisão pendente:** L-15
```
Substituir:
```
- **Descrição:** suíte que prova os requisitos de segurança da seção 6.3: o usuário A não lê, edita nem exclui transações de B; não membro não acessa metas nem aportes; membro comum não executa ações de Admin; nenhum endpoint retorna saldo pessoal de outro usuário.
```
Por:
```
- **Descrição:** suíte que prova os requisitos de segurança das seções 6.2 e 6.3: o usuário A não lê, edita nem exclui transações de B; não membro não acessa metas nem aportes; não membro não se inscreve em `/topic/goals/{id}`; membro comum não executa ações de Admin; nenhum endpoint retorna saldo pessoal de outro usuário.
```
Critérios de aceite revisados:
```
- [ ] Todos os cenários acima automatizados e passando, incluindo a inscrição negada de não membro em `/topic/goals/{id}` (seção 6.2).
- [ ] Suíte roda com um comando documentado.
```

### #107 [REP-03] Relatório mensal em PDF + `GET /api/v1/reports/monthly/pdf`
**O que está errado ou incompleto:** "gerador de PDF na infrastructure" sem o port na application que ele implementa (seção 5.2).
**Depende de:** sem alteração.
**Labels:** sem alteração.

Substituir:
```
- **Descrição:** gerador de PDF na `infrastructure` (seção 5.2) com o fechamento mensal (RF-24, RF-26).
```
Por:
```
- **Descrição:** caso de uso do relatório mensal na `application`, que usa um port de geração de PDF; o gerador de PDF é o adapter desse port na `infrastructure` (seção 5.2). Conteúdo: fechamento mensal (RF-24, RF-26).
```
Critérios de aceite revisados:
```
- [ ] PDF com totais e gastos por categoria.
- [ ] Somente dados do usuário do token.
- [ ] O caso de uso depende apenas do port; a biblioteca de PDF (L-13) aparece somente na `infrastructure`.
```

### #111 [NOT-04] Alerta de 80% do orçamento por push (RN05)
**O que está errado ou incompleto:** não tem descrição. "Não reenvia no mesmo mês" exige guardar que o alerta foi enviado, e o ER não tem onde. Isso vai para a L-08, sem inventar coluna.
**Depende de:** sem alteração.
**Labels:** sem alteração.

Substituir:
```
- **Área:** Back-end · **Milestone:** M4 · **Tamanho:** M · **Depende de:** NOT-01, NOT-03, TX-03
```
Por:
```
- **Área:** Back-end · **Milestone:** M4 · **Tamanho:** M · **Depende de:** NOT-01, NOT-03, TX-03 · **Decisão pendente:** L-08 (registro de "alerta já enviado"), N10 (módulo backend)
- **Descrição:** ao registrar uma despesa, a `BudgetLimitPolicy` (domínio, RN05) verifica se os gastos da categoria atingiram 80% do limite, e o caso de uso aciona o port `PushSender` (seção 5.2; UC09).
```
Critérios de aceite revisados:
```
- [ ] Ao registrar uma despesa que atinge 80% do limite, o push é enviado (inclusive com o app em background, RNF-11).
- [ ] A verificação fica na `BudgetLimitPolicy` (domínio) e o envio usa o port `PushSender`.
- [ ] Não reenvia a cada nova despesa no mesmo mês; o registro de "alerta já enviado" segue a decisão da L-08 (comportamento documentado). (Decisão pendente: L-08.)
```

---

## B. Issues com mudança pequena (18)

### #31 [BE-03] OpenAPI (springdoc) e prefixo `/api/v1`
**O que está incompleto:** não diz que o endpoint WebSocket `/ws` fica fora do prefixo `/api/v1` (seções 2.1 e 3.2; Figura 3).
**Depende de / Labels:** sem alteração.

Substituir:
```
Definir o prefixo `/api/v1` para todos os controllers e disponibilizar o Swagger UI no perfil `dev`.
```
Por:
```
Definir o prefixo `/api/v1` para todos os controllers REST (o endpoint WebSocket `/ws` não usa esse prefixo, seções 2.1 e 3.2) e disponibilizar o Swagger UI no perfil `dev`.
```
Critérios de aceite revisados:
```
- [ ] Swagger UI acessível em `dev`, com o botão de autenticação Bearer.
- [ ] `docs/api/openapi.yaml` gerado e versionado.
- [ ] README do backend explica como atualizar o `openapi.yaml`.
- [ ] Todos os controllers REST respondem sob `/api/v1`; o endpoint WebSocket `/ws` fica fora do prefixo.
```

### #33 [DB-01] Conexão com PostgreSQL e Flyway
**O que está incompleto:** DB-04, DB-05 e DB-06 rodam em paralelo e podem usar o mesmo número de versão Flyway. A convenção é escolhida pelo time na própria task.
**Depende de / Labels:** sem alteração.

Critérios de aceite revisados:
```
- [ ] Com o compose rodando, a API sobe e executa o Flyway sem erro (tabela `flyway_schema_history` criada).
- [ ] `ddl-auto` não cria nem altera tabelas.
- [ ] Convenção de numeração das migrations definida e documentada no README do backend, para evitar versões repetidas quando DB-03 a DB-07 forem desenvolvidas em paralelo.
```

### #50 [SEC-05] Caso de uso RegisterUser + `POST /api/v1/auth/register`
**O que está incompleto:** não define o corpo da resposta 201. MAU-04 depende disso para saber se faz login automático.
**Depende de / Labels:** sem alteração.

Critérios de aceite revisados:
```
- [ ] Cadastro válido → 201, sem expor o hash da senha na resposta.
- [ ] Corpo da resposta 201 (dados do usuário e se inclui ou não tokens) definido no OpenAPI antes do início de MAU-04.
- [ ] E-mail já cadastrado → 409 com mensagem em português.
- [ ] Dados inválidos → 400 com os campos.
- [ ] Teste unitário do caso de uso com fakes dos ports e teste de integração do endpoint.
- [ ] Documentado no OpenAPI (e no `openapi.yaml`).
```

### #60 [REP-01] Resumo mensal + `GET /api/v1/reports/monthly`
**O que está incompleto:** endpoint protegido sem depender de SEC-04.
**Depende de:** adicionar **SEC-04**. **Labels:** sem alteração.

Substituir:
```
- **Depende de:** TX-02
```
Por:
```
- **Depende de:** TX-02, SEC-04
```

### #71 [GOAL-05] GetThermometer + `GET /api/v1/goals/{id}/thermometer`
**O que está incompleto:** "somente membros têm acesso", mas não depende de SEC-04 nem do serviço de autorização de grupo (seção 6.3).
**Depende de:** adicionar **SEC-04, GRP-01**. **Labels:** sem alteração.

Substituir:
```
- **Depende de:** GOAL-02, GOAL-01
```
Por:
```
- **Depende de:** GOAL-02, GOAL-01, SEC-04, GRP-01
```

### #72 [GOAL-06] Consultas e edição de metas (listar, detalhar, histórico, editar)
**O que está incompleto:** aplica a RN04 (Admin) sem depender de GRP-01 nem de SEC-04. O bloqueio pela L-09 continua.
**Depende de:** adicionar **SEC-04, GRP-01**. **Labels:** sem alteração (mantém `blocked:gap`).

Substituir:
```
- **Depende de:** GOAL-02 · **⚠ Bloqueada por lacuna:** L-09
```
Por:
```
- **Depende de:** GOAL-02, SEC-04, GRP-01 · **⚠ Bloqueada por lacuna:** L-09
```

### #73 [GOAL-07] WebSocket/STOMP com autenticação e autorização por tópico
**O que está errado ou incompleto:** aponta o cliente STOMP como MOB-09 (é MOB-10). Para autorizar o tópico, precisa achar o grupo da meta, e não depende de GOAL-02. O handshake precisa ser combinado com SEC-04.
**Depende de:** adicionar **GOAL-02**. **Labels:** sem alteração.

Substituir:
```
- **Depende de:** SEC-04, GRP-01
```
Por:
```
- **Depende de:** SEC-04, GRP-01, GOAL-02
```
Substituir:
```
- **Integração:** API ↔ Mobile (MOB-09).
```
Por:
```
- **Integração:** API ↔ Mobile (MOB-10).
```
Critérios de aceite revisados:
```
- [ ] Conexão sem token ou com token inválido → recusada.
- [ ] Inscrição de não membro em `/topic/goals/{id}` → recusada.
- [ ] Tratamento da autenticação da conexão combinado com SEC-04 (caminho `/ws`).
- [ ] Teste de integração com um cliente STOMP de teste.
```

### #81 [MAU-05] Logout com limpeza de dados locais (UC03)
**O que está incompleto:** depende de SEC-08 (bloqueada pela L-01) sem dizer. A seção 3 manda limpar os dados locais, mas a arquitetura não diz o que fazer com itens `pending` da fila (N5).
**Depende de / Labels:** sem alteração.

Substituir:
```
- **Depende de:** MAU-02, MOB-06, SEC-08
```
Por:
```
- **Depende de:** MAU-02, MOB-06, SEC-08 · **Dependência indireta:** L-01 (via SEC-08) · **Decisão pendente:** N5 (itens `pending` da fila no logout)
```
Acrescentar ao fim da **Descrição**:
```
A chamada a `POST /auth/logout` espera SEC-08 (bloqueada pela L-01); a limpeza local pode ser implementada antes.
```
Critérios de aceite revisados:
```
- [ ] Depois do logout, reabrir o app mostra o fluxo de entrada.
- [ ] Nenhum dado financeiro do usuário anterior permanece no dispositivo.
- [ ] Confirmação antes de sair (padrão do Figma "Sair da Conta").
- [ ] Tratamento dos itens `pending` da fila de sincronização conforme a decisão N5. (Decisão pendente: N5.)
```

### #82 [MAU-06] Telas de Onboarding (1, 2, 3) e "Boas-vindas"
**O que está incompleto:** não diz onde guardar "onboarding já visto" (N6). A seção 5.4.2 prevê SecureStore (tokens) e SQLite; AsyncStorage não está previsto. Não cita a L-04.
**Depende de / Labels:** sem alteração.

Substituir:
```
- **Depende de:** MOB-03, MOB-04
```
Por:
```
- **Depende de:** MOB-03, MOB-04 · **Decisão pendente:** N6 (onde guardar "onboarding já visto"), L-04 (botões Apple/Google)
```
Substituir:
```
Guardar a informação "onboarding já visto" no armazenamento local (`core/storage`) para abrir direto em Boas-vindas nas próximas vezes.
```
Por:
```
Guardar a informação "onboarding já visto" em `core/storage`, no mecanismo definido pela decisão N6, para abrir direto em Boas-vindas nas próximas vezes. Os botões Apple/Google seguem a L-04.
```
Critérios de aceite revisados:
```
- [ ] Fluxo: Passo 1 → 2 → 3 → (Criar conta | Entrar); "Pular" → Boas-vindas.
- [ ] Na segunda abertura, sem sessão, o app abre em Boas-vindas, com a persistência conforme a decisão N6. (Decisão pendente: N6.)
- [ ] Visual fiel ao Figma.
```

### #88 [MTX-04] Tela "Extrato de Transações"
**O que está incompleto:** mostra "saldo disponível" sem dizer a fonte. Pela seção 6.1 e pela Figura 9, o saldo é atualizado pelo ViewModel a partir dos dados locais. Não precisa depender de REP-01.
**Depende de / Labels:** sem alteração.

Acrescentar ao fim da **Descrição**:
```
O saldo disponível vem de `useTransactions`, a partir dos dados locais (seção 6.1).
```
Critérios de aceite revisados:
```
- [ ] Filtros alteram a lista corretamente.
- [ ] O saldo exibido vem do ViewModel (`useTransactions`), sem a tela acessar SQLite ou API.
- [ ] Lista vazia mostra `EmptyState`.
- [ ] Visual fiel ao Figma.
```

### #89 [MTX-05] Tela "Dashboard" (Painel)
**O que está incompleto:** "sem internet, mostra os dados em cache", mas o cache de MOB-06 não inclui o resumo de REP-01, e a arquitetura não diz como ele fica offline (N9).
**Depende de / Labels:** sem alteração.

Substituir:
```
- **Depende de:** MTX-02, REP-01, MOB-03
```
Por:
```
- **Depende de:** MTX-02, REP-01, MOB-03 · **Decisão pendente:** N9 (resumo disponível offline)
```
Critérios de aceite revisados:
```
- [ ] Valores batem com os do backend para o mesmo mês.
- [ ] Sem internet, a tela mostra os dados disponíveis localmente, conforme a decisão N9. (Decisão pendente: N9.)
- [ ] Navegação para Extrato, Adicionar Transação e Perfil (avatar) funcionando.
- [ ] Visual fiel ao Figma. A biblioteca do gráfico de rosca está em L-13.
```

### #91 [MGO-01] Features groups e goals: domain e data
**O que está incompleto:** `useGoalRealtime` precisa do cliente STOMP e não depende de MOB-10. A dependência indireta da L-09 não está escrita. As escritas de grupos e metas não estão ligadas à seção 6.4 (N4).
**Depende de:** adicionar **MOB-10**. **Labels:** sem alteração.

Substituir:
```
- **Depende de:** MOB-09, GRP-03, GRP-04, GOAL-03, GOAL-04, GOAL-05, GOAL-06 · **Decisão pendente:** L-06, L-07, L-09
```
Por:
```
- **Depende de:** MOB-09, MOB-10, GRP-03, GRP-04, GOAL-03, GOAL-04, GOAL-05, GOAL-06 · **Dependência indireta:** L-09 (via GRP-04 e GOAL-06: as listagens esperam; criação, aporte e Termômetro seguem) · **Decisão pendente:** L-06, L-07 · N4 (não impede)
```
Critérios de aceite revisados:
```
- [ ] `useGoalRealtime` atualiza o Termômetro quando outro membro faz um aporte.
- [ ] Ao reabrir ou reconectar, busca `GET /goals/{id}/thermometer`.
- [ ] Escritas de grupos e metas seguem a seção 6.4 (UUID do cliente e fila offline), com exceções conforme a decisão N4.
- [ ] Testes dos Repositories sem renderizar telas.
```

### #106 [REP-02] Calendário financeiro + `GET /api/v1/reports/calendar`
**O que está incompleto:** endpoint protegido sem depender de SEC-04.
**Depende de:** adicionar **SEC-04**. **Labels:** sem alteração.

Substituir:
```
**Depende de:** TX-02
```
Por:
```
**Depende de:** TX-02, SEC-04
```

### #108 [NOT-01] Limites orçamentários + `PUT /api/v1/settings/budget-limits` e BudgetLimitPolicy (RN05)
**O que está incompleto:** não diz em que módulo fica. A seção 5.4.1 não tem módulo `settings` no backend (N10, sem criar módulo novo). Endpoint protegido sem SEC-04.
**Depende de:** adicionar **SEC-04**. **Labels:** sem alteração.

Substituir:
```
**Depende de:** DB-07, TX-02
```
Por:
```
**Depende de:** DB-07, TX-02, SEC-04 · **Decisão pendente (decidir antes de iniciar):** N10 (módulo backend)
```
Acrescentar ao fim da **Descrição**:
```
O módulo backend onde ficam o endpoint e a `BudgetLimitPolicy` segue a decisão N10 (a seção 5.4.1 não tem módulo `settings`).
```

### #109 [NOT-02] Registro de dispositivos + `POST /api/v1/devices`
**O que está incompleto:** não tem descrição.
**Depende de / Labels:** sem alteração.

Substituir:
```
- **Área:** Back-end · **Milestone:** M4 · **Tamanho:** P · **Depende de:** DB-07, SEC-04
```
Por:
```
- **Área:** Back-end · **Milestone:** M4 · **Tamanho:** P · **Depende de:** DB-07, SEC-04 · **Decisão pendente (decidir antes de iniciar):** N10 (módulo backend)
- **Descrição:** `POST /api/v1/devices` salva o token de push do dispositivo na tabela `device_tokens` (`id`, `user_id`, `token`) para o usuário do JWT (seções 3.1, 3.2 e 6.3). Módulo backend conforme a decisão N10.
```

### #112 [NOT-05] Lembrete de 24h sem uso (`@Scheduled`, RN07)
**O que está incompleto:** não tem descrição. O bloqueio pela L-08 está correto.
**Depende de / Labels:** sem alteração (mantém `blocked:gap`).

Substituir:
```
- **Área:** Back-end · **Milestone:** M4 · **Tamanho:** M · **Depende de:** NOT-03 · **⚠ Bloqueada por lacuna:** L-08 (registro da última atividade)
```
Por:
```
- **Área:** Back-end · **Milestone:** M4 · **Tamanho:** M · **Depende de:** NOT-03 · **⚠ Bloqueada por lacuna:** L-08 (registro da última atividade)
- **Descrição:** job agendado com `@Scheduled` (seção 3), implementado como scheduler na `infrastructure` (seção 5.2), no pacote `notifications/scheduler` (seção 5.4.1), que envia o lembrete pelo port `PushSender`.
```

### #113 [MST-02] Mobile: registro do token de push e permissões
**O que está incompleto:** não tem descrição. O tipo de token depende de FCM ou Expo Push (L-13), e a issue depende de NOT-03, que está bloqueada.
**Depende de / Labels:** sem alteração.

Substituir:
```
- **Área:** Mobile · **Milestone:** M4 · **Tamanho:** M · **Depende de:** NOT-02, NOT-03
```
Por:
```
- **Área:** Mobile · **Milestone:** M4 · **Tamanho:** M · **Depende de:** NOT-02, NOT-03 · **Dependência indireta:** L-13 (via NOT-03: FCM ou Expo Push define o tipo de token)
- **Descrição:** após o login, o app pede permissão de notificação, obtém o token de push do serviço definido na L-13 (FCM ou Expo Push, seções 2.1 e 7) e o envia a `POST /api/v1/devices`.
```

### #115 [INF-05] Deploy da API e do banco em nuvem
**O que está incompleto:** não tem descrição. A seção 7 prevê publicação do app por EAS nas lojas, e UC10 prevê logs e monitoramento. Nenhuma issue cobre EAS/lojas, e esta cobre só backups. Não se inventa solução (N7). O bloqueio pela L-18 continua.
**Depende de / Labels:** sem alteração (mantém `blocked:gap`).

Substituir:
```
- **Área:** DevOps · **Milestone:** M4 · **Tamanho:** M · **Depende de:** INF-04 · **⚠ Bloqueada por lacuna:** L-18
```
Por:
```
- **Área:** DevOps · **Milestone:** M4 · **Tamanho:** M · **Depende de:** INF-04 · **⚠ Bloqueada por lacuna:** L-18 · **Decisão pendente:** N7
- **Descrição:** publicar a API (container Docker, seção 7) e o PostgreSQL no provedor definido na L-18, com acesso por HTTPS/WSS, migrations Flyway aplicadas e backups (UC10). A cobertura de build e publicação do app por EAS nas lojas (seção 7) e a ferramenta de logs e monitoramento (UC10) dependem da decisão N7; esta issue não define essas soluções.
```

---

## C. Issues com mudança apenas de texto, referência ou label (7)

### #26 [INF-02] Convenções de contribuição e templates do GitHub
**O que está errado:** cita "seção 0" e "seção 5.3", que são do documento de backlog (a 5.3 da arquitetura é o MVVM). Não cita a L-14 (CI).
**Depende de / Labels:** sem alteração.

Substituir:
```
- **Descrição:** criar o `CONTRIBUTING.md` com o fluxo Git da seção 0 (branches, Conventional Commits, regras de PR e Definition of Done),
```
Por:
```
- **Descrição:** criar o `CONTRIBUTING.md` com o fluxo Git da seção 0 do documento de backlog (branches, Conventional Commits, regras de PR e Definition of Done),
```
Substituir:
```
  - [ ] Labels criadas no repositório (lista na seção 5.3).
```
Por:
```
  - [ ] Labels criadas no repositório (lista na seção 5.3 do documento de backlog).
```
Acrescentar ao fim da **Descrição**:
```
Integração contínua (build, testes e lint nas PRs) fica fora desta task até a decisão da L-14.
```

### #45 [DB-07] Migration de limites orçamentários e tokens de dispositivo
**O que está errado:** tem `release:mvp`, mas a própria issue é Milestone M4 e só alimenta NOT-01/NOT-02 (Release 2). "Onda: a definir".
**Depende de:** sem alteração.
**Labels:** adicionar **`release:2`**; remover **`release:mvp`**.

Substituir:
```
**Onda:** a definir
```
Por:
```
**Onda:** 10
```

### #47 [SEC-02] Persistência de usuários (adapter JPA)
**O que está errado:** o teste de integração depende da L-15, que não aparece no cabeçalho.
**Depende de / Labels:** sem alteração.

Substituir:
```
- **Depende de:** SEC-01, DB-02
```
Por:
```
- **Depende de:** SEC-01, DB-02 · **Decisão pendente:** L-15 (banco dos testes de integração)
```

### #80 [MAU-04] Tela "Criar Nova Conta" + cadastro
**O que está errado:** não cita a L-04 (botões Apple/Google), que lista MAU-04. O comportamento pós-cadastro depende da resposta definida em SEC-05.
**Depende de / Labels:** sem alteração.

Substituir:
```
- **Depende de:** MAU-02, MOB-03
```
Por:
```
- **Depende de:** MAU-02, MOB-03 · **Decisão pendente:** L-04 (botões Apple/Google), L-19 (Termos de Uso)
```
Substituir:
```
Após o cadastro, fazer login automaticamente ou levar à tela de login, conforme o retorno de `POST /auth/register`.
```
Por:
```
Após o cadastro, fazer login automaticamente ou levar à tela de login, conforme a resposta de `POST /auth/register` definida no OpenAPI em SEC-05.
```

### #87 [MTX-03] Tela "Adicionar Transação" (criar, editar e excluir)
**O que está errado:** não cita a L-16 (exclusão em mês fechado) nem a L-21 (textos em inglês), que listam MTX-03.
**Depende de / Labels:** sem alteração.

Substituir:
```
- **Depende de:** MTX-02, MOB-03 · **Decisão pendente:** L-11, L-08
```
Por:
```
- **Depende de:** MTX-02, MOB-03 · **Decisão pendente:** L-11, L-08, L-16 (exclusão em mês fechado), L-21 (textos em inglês do Figma)
```

### #92 [MGO-02] Componente `Thermometer.tsx`
**O que está errado:** depende do formato do status sem citar a decisão N2.
**Depende de / Labels:** sem alteração.

Substituir:
```
- **Depende de:** MOB-03, GOAL-01 (formato do status)
```
Por:
```
- **Depende de:** MOB-03, GOAL-01 (formato do status) · **Decisão pendente:** N2
```

### #95 [MGO-05] Tela "Caixinha - Detalhes (Compartilhada)" com Termômetro em tempo real
**O que está errado:** cita os textos em inglês do Figma sem referenciar a L-21.
**Depende de / Labels:** sem alteração.

Substituir:
```
  - [ ] Visual fiel ao Figma (textos em português; o Figma tem alguns em inglês, como "Contributors" e "See all").
```
Por:
```
  - [ ] Visual fiel ao Figma (textos em português; o Figma tem alguns em inglês, como "Contributors" e "See all"; ver L-21).
```

---

## D. Lacunas com ajuste (11). Nenhuma é mesclada.

Nas lacunas que passam a ter `release:mvp`, a linha de prioridade segue o formato das lacunas MVP já existentes.

### #117 [L-02] Lacuna: "Lembrar de mim"
**Labels:** adicionar **`release:mvp`**; remover: nenhuma.
Substituir:
```
- **Tasks afetadas:** MAU-03
```
Por:
```
- **Tasks afetadas:** MAU-03, MOB-05, MAU-01, MAU-02
```
Acrescentar ao fim:
```
> Prioridade: necessária para concluir uma task do MVP (critério de MAU-03).
```

### #121 [L-06] Lacuna: Caixinha individual
**Labels:** sem alteração.
Substituir:
```
- **Tasks afetadas:** DB-06, GOAL-03, MGO-03, MGO-04, MGO-10
```
Por:
```
- **Tasks afetadas:** DB-05, DB-06, GOAL-03, MGO-01, MGO-03, MGO-04, MGO-10
```

### #122 [L-07] Lacuna: Retirada da Caixinha
**Labels:** sem alteração.
Substituir:
```
- **Tasks afetadas:** DB-06, GOAL-04, MGO-06, MGO-10
```
Por:
```
- **Tasks afetadas:** DB-06, GOAL-04, MGO-01, MGO-06, MGO-10
```

### #123 [L-08] Lacuna: Colunas ausentes no ER
**Labels:** sem alteração.
Substituir:
```
- **Tasks afetadas:** DB-02, DB-04, DB-06, TX-05, MTX-03, MGO-04, MGO-09, NOT-05
```
Por:
```
- **Tasks afetadas:** DB-02, DB-04, DB-06, TX-05, MOB-06, MTX-03, MGO-04, MGO-09, NOT-04, NOT-05
```
Acrescentar depois do parágrafo das colunas:
```
Observação: `updated_at` em `transactions` é exigido pela seção 6.4 da Arquitetura v2.0 e passa a ser criado em DB-04. Esta lacuna continua cobrindo `description`, `created_at`, os campos de `goals`, o registro da última atividade (NOT-05) e o registro de "alerta de 80% já enviado" (NOT-04).
```

### #125 [L-10] Lacuna: Papéis
**Labels:** adicionar **`release:mvp`**; remover: nenhuma.
Acrescentar ao fim:
```
> Prioridade: necessária para concluir uma task do MVP (critério "quem pode convidar" de GRP-05).
```

### #126 [L-11] Lacuna: Categorias
**Labels:** adicionar **`release:mvp`**; remover: nenhuma.
Acrescentar ao fim:
```
> Prioridade: necessária para concluir tasks do MVP (DB-04, TX-01, MTX-01, MTX-03).
```

### #127 [L-12] Lacuna: Telas sem protótipo
**Labels:** sem alteração.
Substituir:
```
- **Tasks afetadas:** MST-01, MST-03
```
Por:
```
- **Tasks afetadas:** MST-01, MST-03, MGO-07
```

### #128 [L-13] Lacuna: Versões e bibliotecas não especificadas
**Labels:** adicionar **`release:mvp`**; remover: nenhuma.
Substituir:
```
- **Tasks afetadas:** BE-01, SEC-03, REP-03, NOT-03, MOB-07, MOB-08, MOB-09, MOB-10, MTX-05
```
Por:
```
- **Tasks afetadas:** BE-01, SEC-03, REP-03, NOT-03, MOB-01, MOB-03, MOB-05, MOB-06, MOB-07, MOB-08, MOB-09, MOB-10, MTX-05
```
Acrescentar ao fim:
```
> Prioridade: bloqueia o início do MVP. BE-01 (Onda 1) precisa das versões de Java e Spring Boot antes de começar; o framework de testes do mobile é necessário para MOB-01, MOB-03, MOB-05 e MOB-06.
```

### #130 [L-15] Lacuna: Banco para testes de integração
**Labels:** adicionar **`release:mvp`**; remover: nenhuma.
Acrescentar ao fim:
```
> Prioridade: necessária para concluir tasks do MVP a partir da Onda 4 (primeiro teste de integração em SEC-02).
```

### #131 [L-16] Lacuna: RN03 na exclusão
**Labels:** adicionar **`release:mvp`**; remover: nenhuma.
Substituir:
```
- **Tasks afetadas:** TX-06, MTX-03
```
Por:
```
- **Tasks afetadas:** TX-01, TX-06, MTX-03 · Relacionada: TX-03 (RN03 na criação, decisão N3; tratar separadamente, sem mesclar)
```
Acrescentar ao fim:
```
> Prioridade: necessária para concluir uma task do MVP (critério de mês fechado de TX-06).
```

### #132 [L-17] Lacuna: Quem cria metas no grupo
**Labels:** adicionar **`release:mvp`**; remover: nenhuma.
Acrescentar ao fim:
```
> Prioridade: necessária para concluir tasks do MVP (GOAL-03, MGO-04).
```

---

## E. Decisões que precisam de decisão humana antes da implementação

Nenhuma decisão foi tomada aqui. Cada linha diz o que precisa ser respondido, o que a resposta destrava e o que pode seguir sem ela. N8, N9 e N10 foram identificadas na segunda passada da revisão.

| ID | O que precisa ser decidido | Issues afetadas | Quando precisa estar decidida | O que segue sem a decisão |
|---|---|---|---|---|
| N1 | Como `RootNavigator`/`AuthStack`/`MainTabs` (em `core/navigation`, seção 5.4.2) chegam às telas das features, cumprindo também "o core nunca importa de uma funcionalidade" (seção 5.3) | MOB-01, MOB-04 (e, indiretamente, todas as telas) | Antes de ligar a primeira tela real no navegador (MAU-06/MAU-03) | MOB-01 e MOB-04 com placeholders |
| N2 | Faixas e formato do status do Termômetro (a seção 6.2 define só as entradas: acumulado, meta e prazo restante) | GOAL-01, GOAL-05, GOAL-08, MGO-02, MGO-05, MGO-10 | Antes de concluir GOAL-01 | Cálculo de acumulado e percentual, endpoints e telas sem a faixa |
| N3 | Regra exata da RN03 para **criação** de transação em mês fechado (a seção 6.1 manda validar a RN03 no `RegisterTransaction`) | TX-03 (relacionada à L-16, sem mesclar) | Antes de concluir TX-03 | Criação, idempotência e isolamento |
| N4 | Se há exceções à regra da seção 6.4 ("todas as escritas... UUID gerado no cliente... criação idempotente") para grupos, metas e edições | GRP-03, GOAL-03, MGO-01 | Não impede: até decidir, vale a leitura literal da seção 6.4 | Tudo |
| N5 | O que acontece com os itens `pending` da fila no logout (a seção 3 manda limpar os dados locais) | MAU-05 (e MOB-09) | Antes de concluir MAU-05 | Logout, limpeza e confirmação |
| N6 | Onde guardar preferências locais não sensíveis, como "onboarding já visto", e se sobrevivem ao logout (a seção 5.4.2 prevê SecureStore e SQLite; AsyncStorage não está previsto) | MAU-06 | Antes de concluir MAU-06 | Telas e navegação do onboarding |
| N7 | (a) Onde fica, no backlog, a publicação do app por EAS nas lojas (EAS e lojas já estão decididos na seção 7); (b) qual ferramenta de logs e monitoramento atende a UC10 (não definida no documento) | INF-05 (e QA-04 para a publicação) | Antes da publicação nas lojas / Release 2 | Todo o código do MVP |
| N8 | Se o Admin pode remover a si mesmo (a v2.0 cita a RN04 sem descrever o conteúdo; confirmar no Documento de Visão v1.1) | GRP-06, MGO-09 | Antes de concluir GRP-06 | Remoção de membros pelo Admin e 403 para membro comum |
| N9 | Como o resumo do dashboard (`GET /reports/monthly`) fica disponível offline (o cache de MOB-06 não o inclui) | MTX-05 | Antes de concluir MTX-05 | Dashboard online |
| N10 | Em que módulo backend existente ficam limites orçamentários e dispositivos (a seção 5.4.1 não tem `settings`) | NOT-01, NOT-02, NOT-04 | Antes de iniciar NOT-01/NOT-02 (Release 2) | Todo o MVP |

### Proposta de issue nova (não criada), ligada à N7

A cobertura de **build e publicação do app por EAS nas lojas** (seção 7; Figuras 1, 2 e 11) não cabe em nenhuma issue existente. INF-05 é o deploy da API e do banco, e QA-04 é a PR de release com a tag. Se a resposta da N7 (a) for "issue própria", o texto sugerido é:

```
[INF-06] Build e publicação do app por EAS

**Task:** INF-06 · **Épico:** E9 · Release 2 (pós-MVP) · **Onda:** 10

- **Área:** DevOps · Mobile · **Milestone:** M4 · **Tamanho:** M
- **Depende de:** MOB-01, INF-05 · **Decisão pendente:** N7
- **Descrição:** configurar o build e a publicação do aplicativo a partir de `mobile/` com EAS, gerando `.aab` para o Google Play e `.ipa` para a App Store, apontando para a API publicada por HTTPS/WSS (seção 7; REST-07).
- **Critérios de aceite:**
  - [ ] Build Android (`.aab`) e iOS (`.ipa`) gerados por EAS a partir de `mobile/`.
  - [ ] O app de produção usa a URL pública da API (HTTPS/WSS).
  - [ ] Credenciais de loja e de build fora do repositório.
  - [ ] Passos de publicação documentados no README do mobile.

---
Fonte: backlog MoneyWise (baseado no Documento de Arquitetura v2.0). Siga o fluxo Git e a Definition of Done do `CONTRIBUTING.md` (INF-02).
```
Labels sugeridas: `area:devops`, `area:mobile`, `type:feature`, `release:2`.

A parte (b) da N7, logs e monitoramento, pode caber em INF-05 depois da decisão e não precisa de issue nova.

---

## Issues que não devem ser alteradas

**Tasks (46):** INF-01 (#25), INF-03 (#27), INF-04 (#38), BE-02 (#30), MOB-02 (#34), MOB-03 (#39), MOB-05 (#36), MOB-06 (#37), DB-02 (#40), DB-03 (#41), SEC-01 (#46), SEC-06 (#51), SEC-07 (#52), SEC-08 (#53), TX-01 (#54), TX-02 (#55), TX-04 (#57), TX-06 (#59), GRP-01 (#61), GRP-02 (#62), GRP-04 (#64), GRP-05 (#65), GOAL-02 (#68), MOB-07 (#75), MOB-08 (#76), MAU-01 (#77), MAU-02 (#78), MAU-03 (#79), MAU-07 (#83), MOB-09 (#84), MTX-01 (#85), MTX-02 (#86), MOB-10 (#90), MGO-03 (#93), MGO-04 (#94), MGO-06 (#96), MGO-07 (#97), MGO-08 (#98), MGO-09 (#99), MGO-10 (#100), MST-01 (#101), QA-02 (#103), QA-03 (#104), QA-04 (#105), NOT-03 (#110), MST-03 (#114).

**Lacunas (10):** L-01 (#116), L-03 (#118), L-04 (#119), L-05 (#120), L-09 (#124), L-14 (#129), L-18 (#133), L-19 (#134), L-20 (#135), L-21 (#136).
