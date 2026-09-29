/** Traduz os códigos de erro do Firebase para mensagens em português. */
const messages: Record<string, string> = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/missing-email': 'Informe o e-mail.',
  'auth/missing-password': 'Informe a senha.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.', // RN-06
  'auth/weak-password': 'A senha precisa ter pelo menos 8 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com a internet.',
  'permission-denied': 'Você não tem permissão para esta ação.',
  unavailable: 'Serviço indisponível. Verifique sua conexão.',
};

/** Erro de negócio com mensagem pronta para mostrar ao usuário. */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  const code = (error as { code?: string } | null)?.code;
  if (code && messages[code]) return messages[code];
  return 'Algo deu errado. Tente novamente.';
}
