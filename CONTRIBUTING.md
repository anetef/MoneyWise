# Como contribuir com o MoneyWise

Este guia reúne as regras de trabalho do time: como criar branches, escrever commits, abrir Pull Requests e quando uma task está pronta. Ele segue a seção 0 do backlog do projeto, que é baseado no Documento de Arquitetura v2.0.

> **Regra de ouro:** uma task = uma branch = uma Pull Request.

## Sumário

1. [Regras gerais](#1-regras-gerais)
2. [Branches](#2-branches)
3. [Passo a passo de uma task](#3-passo-a-passo-de-uma-task)
4. [Commits (Conventional Commits)](#4-commits-conventional-commits)
5. [Pull Requests](#5-pull-requests)
6. [Revisão e merge](#6-revisão-e-merge)
7. [Definition of Done](#7-definition-of-done)
8. [Issues e labels](#8-issues-e-labels)

---

## 1. Regras gerais

1. **Não altere a arquitetura** do Documento de Arquitetura v2.0 nem adicione tecnologias que ele não cita. Se precisar de algo que o documento não define, registre a lacuna (issue com a label `blocked:gap`) e combine com o time antes de seguir.
2. **Regras de negócio ficam no domínio do backend.** O app valida só para dar retorno rápido ao usuário; o backend é a fonte da verdade.
3. **A tela nunca fala com a API nem com o banco.** No mobile: View → ViewModel (hook) → Repository. No backend: `presentation` → `application` → `domain`, e a `infrastructure` implementa os ports.
4. **O usuário vem sempre do JWT**, nunca do corpo da requisição.
5. **Nomes de código em inglês** (classes, arquivos, tabelas, endpoints). **Textos ao usuário e documentação em português.**
6. **Valores monetários** são `DECIMAL` no banco e `BigDecimal` no Java, nunca ponto flutuante.

## 2. Branches

| Branch | Uso |
|---|---|
| `main` | Estado estável. Só recebe merge de `develop` por PR de release, quando o MVP estiver completo e validado (tag `v1.0.0-mvp`). |
| `develop` | Integração. Recebe as PRs aprovadas das tasks. |
| `feature/<ID-da-task>-<descricao-curta>` | Uma por task, criada a partir de `develop`. Ex.: `feature/SEC-05-register-user` |
| `fix/<ID>-<descricao>` | Correções encontradas durante a integração. Ex.: `fix/TX-03-idempotency-key` |

- Ninguém faz push direto em `main` ou `develop`: as duas branches são protegidas e só aceitam merge por PR aprovada.
- A descrição curta da branch vai em inglês, minúscula e com hífens.

## 3. Passo a passo de uma task

```bash
# 1. Atualize a develop
git checkout develop
git pull origin develop

# 2. Crie a branch da task
git checkout -b feature/SEC-05-register-user

# 3. Trabalhe e faça commits pequenos (ver seção 4)
git add .
git commit -m "feat: adiciona caso de uso de cadastro de usuário"

# 4. Antes de abrir a PR, traga a develop atualizada
git fetch origin
git merge origin/develop

# 5. Envie a branch e abra a PR para develop no GitHub
git push -u origin feature/SEC-05-register-user
```

No quadro do projeto, mova o card da task para **Em andamento** ao começar e para **Em revisão** ao abrir a PR.

## 4. Commits (Conventional Commits)

Formato:

```
<tipo>(escopo opcional): <descrição curta em português, no presente>

[corpo opcional: o quê e por quê]

[rodapé opcional: Refs #n]
```

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `test` | Adição ou correção de testes |
| `refactor` | Mudança de código sem mudar comportamento |
| `chore` | Manutenção: configuração, dependências, scripts |

Exemplos:

```
feat(auth): adiciona endpoint de cadastro de usuário
fix(transactions): corrige filtro por período no extrato
docs: adiciona guia de contribuição
test(goals): cobre cálculo do termômetro com aporte acima da meta
chore(mobile): atualiza dependências do Expo
```

- Mensagens **em português**, no presente ("adiciona", "corrige", "atualiza"), começando com letra minúscula e sem ponto final.
- Um commit trata de um assunto só. Não misture mudanças sem relação.

## 5. Pull Requests

- **Título** com o ID da task: `[SEC-05] Cadastro de usuário`.
- **Base:** `develop` (só a PR de release usa `main` como base).
- **Descrição:** preencha o template (é carregado automaticamente). Ele pede o link da issue (`Closes #n`), o que foi feito, como testar e o checklist da Definition of Done.
- Antes de abrir: `develop` atualizada na sua branch, build passando e testes da task passando na sua máquina.
- PR pequena e focada: se a task ficou grande demais, converse com o time para dividir.

> Ainda não há integração contínua (build, testes e lint automáticos nas PRs). Isso depende da decisão da lacuna **L-14**. Até lá, quem abre a PR roda build, testes e lint localmente, e quem revisa confere.

## 6. Revisão e merge

- Toda PR precisa de **pelo menos 1 aprovação** de outra pessoa do time antes do merge. Quem abriu a PR não aprova a própria.
- Quem revisa confere os critérios de aceitação da issue e a Definition of Done.
- Pedidos de mudança são respondidos com novos commits na mesma branch.
- O merge em `develop` é feito com **squash and merge**, para que cada task vire um único commit na `develop`. A mensagem do squash segue o padrão de commit (ex.: `feat: adiciona cadastro de usuário (#45)`).
- Depois do merge, apague a branch da task.

## 7. Definition of Done

Uma task só está pronta quando:

- [ ] Critérios de aceitação da task atendidos.
- [ ] Código segue a estrutura de pastas da seção 5.4 da arquitetura.
- [ ] Testes da task escritos e passando.
- [ ] Backend: regras do ArchUnit passando. Mobile: ESLint sem erros.
- [ ] Endpoints novos ou alterados documentados no OpenAPI (springdoc).
- [ ] PR revisada e aprovada, mesclada em `develop`.

## 8. Issues e labels

Cada task do backlog é uma issue com título `[ID] Nome da task`. Para criar uma nova, use **New issue → Task** (template em `.github/ISSUE_TEMPLATE/task.md`).

| Label | Significado |
|---|---|
| `area:backend` | API Spring Boot |
| `area:mobile` | App React Native/Expo |
| `area:database` | PostgreSQL e migrations Flyway |
| `area:devops` | Repositório, Docker, ambiente |
| `area:security` | Autenticação e autorização |
| `area:ui` | Telas e componentes visuais |
| `area:offline` | Cache e fila offline (SQLite) |
| `area:realtime` | WebSocket/STOMP (Termômetro) |
| `type:feature` | Funcionalidade |
| `type:test` | Testes |
| `type:docs` | Documentação |
| `integration:api-mobile` | Integra app e API |
| `blocked:gap` | Bloqueada por lacuna que o time precisa decidir |
| `release:mvp` | Entra no MVP |
| `release:2` | Fica para a segunda versão |
