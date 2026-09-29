import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { getFirebaseAuth } from '@/core/firebase/auth';
import { getDb, isFirebaseConfigured } from '@/core/firebase/config';
import { AppError } from '@/core/utils/errors';
import type { AppUser, SignInInput, SignUpInput } from './types';

/**
 * Camada de DADOS da autenticação (Repository Pattern — arquitetura 5.1).
 * As telas e hooks só conhecem esta interface, nunca o Firebase direto.
 */
export interface AuthRepository {
  /** Avisa sempre que o usuário logado muda. Retorna a função para parar de ouvir. */
  onUserChanged(callback: (user: AppUser | null) => void): () => void;
  signIn(input: SignInInput): Promise<void>;
  signUp(input: SignUpInput): Promise<void>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Implementação real: Firebase Authentication + coleção `users` no Firestore
// ---------------------------------------------------------------------------
class FirebaseAuthRepository implements AuthRepository {
  onUserChanged(callback: (user: AppUser | null) => void) {
    return onAuthStateChanged(getFirebaseAuth(), async (fbUser) => {
      if (!fbUser) return callback(null);
      let name = fbUser.displayName ?? '';
      if (!name) {
        const snap = await getDoc(doc(getDb(), 'users', fbUser.uid)).catch(() => null);
        name = (snap?.data()?.name as string | undefined) ?? fbUser.email?.split('@')[0] ?? 'Usuário';
      }
      callback({ id: fbUser.uid, name, email: fbUser.email ?? '' });
    });
  }

  async signIn({ email, password }: SignInInput) {
    await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  }

  async signUp({ name, email, password }: SignUpInput) {
    // O Firebase Auth já impede dois cadastros com o mesmo e-mail (RF-02 / RN-06).
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    await updateProfile(cred.user, { displayName: name.trim() });
    // Perfil público mínimo, usado para convidar membros para caixinhas pelo e-mail.
    await setDoc(doc(getDb(), 'users', cred.user.uid), {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      currency: 'BRL', // RN-09
      createdAt: serverTimestamp(),
    });
  }

  async signOut() {
    await firebaseSignOut(getFirebaseAuth()); // RF-04
  }

  async resetPassword(email: string) {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
  }
}

// ---------------------------------------------------------------------------
// Modo demonstração: sem Firebase, tudo em memória
// ---------------------------------------------------------------------------
export const DEMO_USER: AppUser = { id: 'demo-user', name: 'Alice Souza', email: 'alice@moneywise.app' };

class DemoAuthRepository implements AuthRepository {
  private user: AppUser | null = null;
  private listeners = new Set<(user: AppUser | null) => void>();
  private registered = new Map<string, { name: string; password: string }>([
    [DEMO_USER.email, { name: DEMO_USER.name, password: '12345678' }],
  ]);

  private emit() {
    this.listeners.forEach((l) => l(this.user));
  }

  onUserChanged(callback: (user: AppUser | null) => void) {
    this.listeners.add(callback);
    callback(this.user);
    return () => {
      this.listeners.delete(callback);
    };
  }

  async signIn({ email, password }: SignInInput) {
    const key = email.trim().toLowerCase();
    const account = this.registered.get(key);
    // No modo demo qualquer e-mail novo entra direto, para facilitar os testes.
    if (account && account.password !== password) throw new AppError('E-mail ou senha incorretos.');
    const name = account?.name ?? key.split('@')[0] ?? 'Usuário';
    this.user = { id: key === DEMO_USER.email ? DEMO_USER.id : key, name, email: key };
    this.emit();
  }

  async signUp({ name, email, password }: SignUpInput) {
    const key = email.trim().toLowerCase();
    if (this.registered.has(key)) throw new AppError('Já existe uma conta com este e-mail.');
    this.registered.set(key, { name: name.trim(), password });
    this.user = { id: key, name: name.trim(), email: key };
    this.emit();
  }

  async signOut() {
    this.user = null;
    this.emit();
  }

  async resetPassword(_email: string) {}
}

/** Escolhe a implementação: Firebase se o `.env` estiver preenchido, senão demo. */
export const authRepository: AuthRepository = isFirebaseConfigured
  ? new FirebaseAuthRepository()
  : new DemoAuthRepository();
