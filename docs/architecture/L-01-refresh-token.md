# L-01 — Política de refresh token

**Status:** decidido
**Tarefas relacionadas:** SEC-03, SEC-07, DB-03, SEC-08

## Contexto

A API usa access tokens JWT de curta duração. Para o usuário não precisar digitar a senha
a cada 15 minutos, o app precisa de um refresh token para pedir novos access tokens.
A arquitetura exige que o logout invalide o refresh token, então ele precisa ficar guardado
no servidor, não pode ser um JWT autossuficiente.

## Decisão

| Item | Decisão |
|---|---|
| Access token | JWT HS256, 15 minutos (`JWT_ACCESS_TOKEN_TTL`) |
| Refresh token | 32 bytes aleatórios (`SecureRandom`), em Base64 URL-safe; não é JWT |
| Duração do refresh token | 30 dias (`JWT_REFRESH_TOKEN_TTL`) |
| Armazenamento | tabela `refresh_tokens` (migration V2), só o hash SHA-256 do token |
| Rotação | sim: cada uso em `/auth/refresh` revoga o refresh token usado e emite um novo |
| Logout | revoga o refresh token informado (`revoked_at`) |
| Exclusão do usuário | `ON DELETE CASCADE` apaga os refresh tokens dele |

## Fluxo

1. Login (ou verificação de e-mail) → access token + refresh token
2. Access token venceu → app chama `POST /api/v1/auth/refresh` com o refresh token
   → recebe um novo access token **e** um novo refresh token; o anterior deixa de valer
3. Logout → `POST /api/v1/auth/logout` com o refresh token → ele é revogado
4. Refresh token inválido, vencido ou revogado → 401

## Consequências

- Como só o hash fica no banco, um vazamento da tabela não permite usar os tokens.
- Com a rotação, um refresh token roubado para de funcionar assim que o dono legítimo usar o dele.
- O app (MOB-07) precisa sempre substituir o refresh token salvo pelo novo que vem na resposta do `/auth/refresh`.
- O access token continua válido até vencer (no máximo 15 minutos), mesmo depois do logout,
  porque ele não é consultado no banco. O app deve apagar os dois tokens ao fazer logout.