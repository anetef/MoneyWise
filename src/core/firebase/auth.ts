import { getAuth, type Auth } from 'firebase/auth';

import { getFirebaseApp } from './config';

/**
 * Firebase Auth na WEB. A sessão fica salva no navegador automaticamente.
 * (No Android/iOS o Metro usa `auth.native.ts` no lugar deste arquivo.)
 */
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}
