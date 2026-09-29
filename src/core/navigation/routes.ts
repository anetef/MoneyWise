/**
 * Mapa central de rotas do app.
 * Use estas constantes em vez de escrever o caminho "na mão" nas telas:
 * se uma rota mudar de nome, basta alterar aqui.
 *
 * Os grupos entre parênteses — (auth), (app), (tabs) — organizam os arquivos
 * mas NÃO aparecem na URL.
 */
export const routes = {
  // Fluxo de entrada (usuário não autenticado)
  onboarding1: '/onboarding/passo-1',
  onboarding2: '/onboarding/passo-2',
  onboarding3: '/onboarding/passo-3',
  welcome: '/boas-vindas',
  signIn: '/entrar',
  signUp: '/cadastro',
  forgotPassword: '/recuperar-senha',

  // App (usuário autenticado) — abas
  dashboard: '/',
  goals: '/caixinhas',
  profile: '/perfil',

  // App — telas empilhadas por cima das abas
  newTransaction: '/transacao/nova',
  statement: '/extrato',
  newGoal: '/caixinhas/nova',
  goalDetails: (id: string) => `/caixinhas/${id}` as const,
  goalStatement: (id: string) => `/caixinhas/${id}/extrato` as const,
  goalSettings: (id: string) => `/caixinhas/${id}/configuracoes` as const,
  goalInvite: (id: string) => `/caixinhas/${id}/convidar` as const,
} as const;
