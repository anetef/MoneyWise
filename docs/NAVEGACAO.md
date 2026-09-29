# Como funciona a navegação do MoneyWise

Usamos o **Expo Router**. A ideia principal é simples:

> **Cada arquivo dentro de `src/app/` é uma tela, e o caminho do arquivo é o endereço da tela.**

| Arquivo | Endereço (rota) | Tela do Figma |
|---|---|---|
| `(auth)/onboarding/passo-1.tsx` | `/onboarding/passo-1` | Onboarding - Passo 1 |
| `(auth)/onboarding/passo-2.tsx` | `/onboarding/passo-2` | Onboarding - Passo 2 |
| `(auth)/onboarding/passo-3.tsx` | `/onboarding/passo-3` | Onboarding - Passo 3: Finalizar |
| `(auth)/boas-vindas.tsx` | `/boas-vindas` | Boas-vindas - Entrar ou Cadastrar |
| `(auth)/entrar.tsx` | `/entrar` | Entrar na Conta |
| `(auth)/cadastro.tsx` | `/cadastro` | Criar Nova Conta |
| `(auth)/recuperar-senha.tsx` | `/recuperar-senha` | Recuperar Senha |
| `(app)/(tabs)/index.tsx` | `/` | Dashboard Individual |
| `(app)/(tabs)/caixinhas.tsx` | `/caixinhas` | Caixinhas - Lista |
| `(app)/(tabs)/perfil.tsx` | `/perfil` | Meu Perfil |
| `(app)/extrato.tsx` | `/extrato` | Extrato de Transações |
| `(app)/transacao/nova.tsx` | `/transacao/nova` | Adicionar Transação |
| `(app)/caixinhas/nova.tsx` | `/caixinhas/nova` | Nova Caixinha - Criar |
| `(app)/caixinhas/[id]/index.tsx` | `/caixinhas/123` | Caixinha - Detalhes |
| `(app)/caixinhas/[id]/extrato.tsx` | `/caixinhas/123/extrato` | Extrato da Caixinha |
| `(app)/caixinhas/[id]/configuracoes.tsx` | `/caixinhas/123/configuracoes` | Caixinha - Configurações |
| `(app)/caixinhas/[id]/convidar.tsx` | `/caixinhas/123/convidar` | Convidar Membros |

## Três conceitos para entender

**1. Pastas entre parênteses são grupos.** `(auth)`, `(app)` e `(tabs)` organizam as telas, mas não aparecem no endereço. Servem para dar um "layout" comum a um conjunto de telas.

**2. `_layout.tsx` define como as telas de uma pasta se comportam.**
- `src/app/_layout.tsx`: o layout raiz. Carrega a fonte, a sessão e decide quem entra onde.
- `(auth)/_layout.tsx`: uma **pilha** (Stack), em que cada tela nova entra por cima da anterior e o "voltar" desempilha.
- `(app)/_layout.tsx`: outra pilha, com as abas na base e as telas internas por cima.
- `(app)/(tabs)/_layout.tsx`: a **barra de abas** (Painel, Caixinhas e Perfil).

**3. `[id]` é um parâmetro.** `caixinhas/[id]` atende `/caixinhas/abc`, `/caixinhas/xyz` etc. Na tela, lemos o valor com `useLocalSearchParams()`.

## Proteção de rotas (login)

No layout raiz:

```tsx
<Stack.Protected guard={!user}>   {/* só sem login */}
  <Stack.Screen name="(auth)" />
</Stack.Protected>
<Stack.Protected guard={!!user}>  {/* só com login */}
  <Stack.Screen name="(app)" />
</Stack.Protected>
```

Quando alguém faz login, `user` passa a existir e o Expo Router **leva automaticamente** para o Dashboard. No logout acontece o contrário. Por isso as telas de login não precisam chamar `router.replace('/')`. Isso implementa o **Fluxo de Entrada** da seção 4.2 do Documento de Arquitetura (UC01, UC02 e UC03).

## Como navegar a partir de uma tela

```tsx
import { router } from 'expo-router';
import { routes } from '@/core/navigation/routes';

router.push(routes.statement);         // abre por cima (dá para voltar)
router.replace(routes.signIn);         // troca a tela atual (não volta)
router.back();                         // volta
router.push(routes.goalDetails(id));   // com parâmetro
```

Sempre use as constantes de `src/core/navigation/routes.ts` em vez de escrever o endereço à mão.

## Fluxo completo

```
Primeira vez:  Onboarding 1 → 2 → 3 ─┬─ Criar conta ──┐
                (Pular → Boas-vindas) └─ Entrar ──────┤
Próximas vezes: Boas-vindas ─┬─ Criar conta ──────────┤
                             └─ Entrar ─ Esqueci senha │
                                                       ▼
                         ┌──────── App logado ────────┐
                         │ [Painel] [Caixinhas] [Perfil]
                         └────────────────────────────┘
Painel     → (+) Adicionar transação · Ver extrato completo
Caixinhas  → Detalhes → Extrato · Configurações · Convidar membros
           → Nova caixinha
Perfil     → Sair (volta para Boas-vindas)
```
