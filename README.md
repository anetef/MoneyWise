# MoneyWise

Aplicativo de gestão financeira pessoal e colaborativa (TCC — Universidade Católica de Brasília).

**Stack:** Expo + React (TypeScript) · Expo Router (navegação) · Firebase (Authentication + Firestore)

---

## Como rodar

```bash
# 1. Instalar as dependências
npm install

# 2. Configurar o Firebase (veja a seção abaixo)
cp .env.example .env

# 3. Iniciar
npx expo start          # abre o menu (Android, iOS ou web)
npx expo start --web    # direto no navegador
```

Para testar no celular, instale o app **Expo Go** e leia o QR Code que aparece no terminal.

### Scripts úteis

| Comando | O que faz |
|---|---|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run web` | Abre no navegador |
| `npm run typecheck` | Verifica os tipos TypeScript |

---

## Estrutura de pastas

O código segue a organização **por funcionalidade (feature-first)** definida no Documento de Arquitetura (seção 5.2):

```
src/
├── app/                  # ROTAS (Expo Router): cada arquivo é uma tela
│   ├── _layout.tsx       # Layout raiz: fontes, provedores e proteção de rotas
│   ├── (auth)/           # Telas para quem NÃO está logado
│   └── (app)/            # Telas para quem ESTÁ logado
│       └── (tabs)/       # Abas inferiores: Painel, Caixinhas, Perfil
├── core/                 # Código compartilhado por todas as features
│   ├── components/       # Botões, cards, textos, inputs...
│   ├── firebase/         # Inicialização do Firebase
│   ├── theme/            # Cores, fontes e espaçamentos do Figma
│   └── utils/            # Formatação de moeda, datas...
└── features/             # Uma pasta por funcionalidade
    ├── auth/             # Login, cadastro, sessão (RF-01 a RF-04)
    ├── transactions/     # Receitas e despesas (RF-05 a RF-10)
    ├── groups/           # Caixinhas e membros (RF-11 a RF-16)
    ├── goals/            # Termômetro de metas (RF-17 a RF-20)
    ├── reports/          # Relatórios (RF-21 a RF-24)
    └── settings/         # Perfil e configurações
```

Dentro de cada feature, as camadas seguem a regra de dependência da arquitetura:

```
screens/  (UI)  →  use*.ts (hooks: lógica e estado)  →  *Repository.ts (dados)  →  Firebase
```

A tela **nunca** acessa o Firebase diretamente, só através do hook, que usa o repositório.

---

## Fluxo de trabalho com Git

Usamos um **Git Flow** simplificado:

| Branch | Para que serve |
|---|---|
| `main` | Versão estável (entregas/apresentações) |
| `develop` | Integração, onde as features se juntam |
| `feature/<nome>` | Uma branch por funcionalidade, criada a partir da `develop` |

```bash
git checkout develop
git pull
git checkout -b feature/minha-tela
# ... trabalhar e commitar ...
git push -u origin feature/minha-tela
# abrir Pull Request: feature/minha-tela → develop
```

**Padrão de commits** ([Conventional Commits](https://www.conventionalcommits.org/pt-br/)):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `refactor:` mudança de código sem mudar comportamento
- `style:` ajustes visuais/formatação
- `docs:` documentação
- `chore:` configuração, dependências
