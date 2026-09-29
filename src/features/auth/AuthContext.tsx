import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { AppUser, SignInInput, SignUpInput } from './types';

type AuthState = {
  user: AppUser | null;
  /** true enquanto verificamos se já existe uma sessão salva (RF-03). */
  initializing: boolean;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/**
 * Guarda quem está logado e disponibiliza isso para o app inteiro.
 * O layout raiz usa `user` para decidir quais telas podem ser abertas.
 *
 * Nesta etapa a sessão é só em memória, para testar a navegação.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

  const signIn = useCallback(async ({ email }: SignInInput) => {
    setUser({ id: 'demo', name: 'Usuário Demo', email });
  }, []);

  const signUp = useCallback(async ({ name, email }: SignUpInput) => {
    setUser({ id: 'demo', name, email });
  }, []);

  const signOut = useCallback(async () => setUser(null), []);
  const resetPassword = useCallback(async (_email: string) => {}, []);

  const value = useMemo(
    () => ({ user, initializing: false, signIn, signUp, signOut, resetPassword }),
    [user, signIn, signUp, signOut, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook para acessar a sessão em qualquer tela: `const { user, signOut } = useAuth()`. */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
