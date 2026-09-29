import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FirebaseAuth from 'firebase/auth';
import { getAuth, initializeAuth, type Auth, type Persistence } from 'firebase/auth';

import { getFirebaseApp } from './config';

/*
 * `getReactNativePersistence` só existe no pacote do Firebase para React
 * Native. O Metro carrega essa versão no celular, mas os tipos do TypeScript
 * são os da versão web, por isso o acesso tipado manualmente abaixo.
 */
const getReactNativePersistence = (
  FirebaseAuth as unknown as {
    getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
  }
).getReactNativePersistence;

let auth: Auth | undefined;

/**
 * Firebase Auth no ANDROID/iOS, com a sessão salva no AsyncStorage.
 * É isso que mantém o usuário logado ao fechar e reabrir o app (RF-03 / UC02).
 */
export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  const app = getFirebaseApp();
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    auth = getAuth(app); // já inicializado (recarregamento em desenvolvimento)
  }
  return auth;
}
