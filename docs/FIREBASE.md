# Conectando o MoneyWise ao Firebase

O app funciona de dois jeitos:

| Modo | Quando | Dados |
|---|---|---|
| **Demonstração** | o `.env` está vazio ou não existe | Exemplos do Figma, guardados só na memória |
| **Firebase** | o `.env` está preenchido | Reais, salvos no Firestore e sincronizados entre usuários |

Assim dá para rodar e apresentar as telas mesmo antes de criar o projeto no Firebase.
No modo demonstração, qualquer e-mail entra, e `alice@moneywise.app` / `12345678` é a conta de exemplo.

---

## Passo a passo (uma vez só, feito por alguém do grupo)

1. Acesse https://console.firebase.google.com e clique em **Adicionar projeto** (nome: `moneywise`). O Google Analytics pode ficar desativado.
2. **Authentication** → *Começar* → aba **Método de login** → ative **E-mail/senha**.
3. **Firestore Database** → *Criar banco de dados* → local `southamerica-east1 (São Paulo)` → **modo de produção**.
4. **Firestore → Regras**: apague o conteúdo, cole o arquivo [`firestore.rules`](../firestore.rules) deste repositório e clique em **Publicar**.
5. **Configurações do projeto** (engrenagem) → *Seus apps* → ícone **Web `</>`** → apelido `moneywise-app` → **Registrar app**.
6. Vai aparecer um objeto `firebaseConfig`. Copie os valores para um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

```ini
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=moneywise-xxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=moneywise-xxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=moneywise-xxxx.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

7. Reinicie o Expo (`npx expo start -c`). Pronto: o app já está usando o Firebase.

> O `.env` **não** vai para o GitHub (está no `.gitignore`). Mande os valores para o grupo por mensagem privada.

8. **Índice do extrato:** na primeira vez que o Dashboard carregar, o Firestore pode mostrar no terminal um erro com um link *"The query requires an index"*. Clique no link e em **Criar índice**. Ou rode `firebase deploy --only firestore:indexes`, que usa o [`firestore.indexes.json`](../firestore.indexes.json).

---

## Como os dados ficam guardados

```
users/{uid}                       nome, e-mail, moeda
transactions/{id}                 userId, type (income|expense), amount, categoryId, description, date
goals/{goalId}                    caixinha: name, targetAmount, savedAmount, deadline, shared,
                                  adminId, memberIds[], members{uid: {name, role, contributed}}
goals/{goalId}/entries/{id}       aportes, retiradas e rendimentos da caixinha
```

## Como o código conversa com o Firebase

Seguimos a **regra de dependência** do Documento de Arquitetura (5.3):

```
Tela (UI)  →  hook useX()  →  xRepository  →  Firebase SDK
```

| Camada | Arquivo de exemplo | Responsabilidade |
|---|---|---|
| Tela | `app/(app)/(tabs)/index.tsx` | Mostrar dados e capturar toques |
| Lógica (hook) | `features/transactions/useTransactions.ts` | Validar, calcular totais, aplicar regras (RN-03, RN-04...) |
| Dados (repositório) | `features/transactions/transactionRepository.ts` | Ler e gravar no Firestore |
| Infra | `core/firebase/config.ts` | Inicializar o Firebase |

Cada repositório tem **duas implementações** da mesma interface: `Firestore...Repository` (real) e `Demo...Repository` (memória). O arquivo escolhe sozinho qual usar. Isso também atende o **RNF-10** (testar a lógica sem Firebase).

### Tempo real e offline

- `onSnapshot` mantém as telas atualizadas sozinhas. Quando um membro faz um aporte, o termômetro dos outros atualiza na hora (RF-16, RF-19).
- O cache local do Firestore guarda as escritas feitas sem internet e envia quando a conexão volta (RNF-02, RNF-12).
- A sessão fica salva (AsyncStorage no celular), então o usuário continua logado ao reabrir o app (RF-03).

### Limitações conhecidas do protótipo

- Estamos usando o **SDK JavaScript** do Firebase, que roda no **Expo Go** sem precisar compilar o app. No celular, o cache offline dura enquanto o app está aberto. Para cache persistente seria preciso o `@react-native-firebase` com um *development build*.
- Um membro comum consegue atualizar o campo `members` da caixinha (para registrar a própria contribuição). Em produção, essa soma deveria ser feita por uma **Cloud Function**.
- Notificações push (FCM, RF-28) ainda não estão implementadas.
