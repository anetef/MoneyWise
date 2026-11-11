# MoneyWise · Aplicativo móvel

Aplicativo do MoneyWise para Android e iOS, feito com **React Native**, **Expo** e **TypeScript**. Ele consome a API REST do projeto (pasta `backend/`) e recebe as atualizações do Termômetro em tempo real via WebSocket/STOMP.

A visão geral do projeto, a arquitetura e as regras de contribuição estão no [README principal](../README.md) e no [CONTRIBUTING.md](../CONTRIBUTING.md).

## Organização

```
src/
├── core/        # api, navigation, realtime, storage, theme, utils
└── features/    # auth, onboarding, transactions, reports, goals
```

O app segue **MVVM com Repository**: a tela (View) usa um ViewModel (hook), que chama um Repository, e só o Repository fala com a API ou com o armazenamento local.

## Como rodar

1. Suba o banco e a API seguindo o [README principal](../README.md#-como-executar).
2. Crie o arquivo `mobile/.env.local` com o endereço da API. No celular, use o IP do computador na rede, e não `localhost`:

   ```bash
   EXPO_PUBLIC_API_URL=http://192.168.0.10:8080/api/v1
   ```

3. Instale as dependências e inicie o Expo:

   ```bash
   npm install
   npx expo start
   ```

4. Leia o QR Code com o app **Expo Go** ou pressione `a` (Android) ou `i` (iOS) para abrir no emulador.

O app não será publicado nas lojas nesta versão: ele é instalado e apresentado pelo Expo.
