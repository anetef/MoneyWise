import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { authRepository } from './authRepository';
import type { AppUser, SignInInput, SignUpInput } from './types';

type AuthState = {
  user: AppUser | null;
  /** true enquanto o Firebase verifica se já existe uma sessão salva (RF-03). */
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
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Fica "ouvindo" o Firebase: dispara no login, no logout e ao abrir o app
    // com uma sessão já salva (UC02 — Manter sessão persistente).
    const unsubscribe = authRepository.onUserChanged((nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      initializing,
      signIn: (input) => authRepository.signIn(input),
      signUp: (input) => authRepository.signUp(input),
      signOut: () => authRepository.signOut(),
      resetPassword: (email) => authRepository.resetPassword(email),
    }),
    [user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook para acessar a sessão em qualquer tela: `const { user, signOut } = useAuth()`. */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}

/** Atalho para telas do grupo (app), onde sempre há um usuário logado. */
export function useCurrentUser(): AppUser {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser usado fora de uma tela autenticada');
  return user;
}
