import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { Platform } from 'react-native';

/**
 * Configuração do Firebase lida do arquivo `.env` (veja `.env.example`).
 * Variáveis com prefixo EXPO_PUBLIC_ são embutidas no app pelo Expo.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/**
 * `true` quando o `.env` foi preenchido. Se estiver vazio, o app roda em
 * **modo demonstração** (dados de exemplo em memória), assim dá para testar
 * a navegação e as telas sem ter um projeto Firebase.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase não configurado. Copie .env.example para .env e preencha as chaves.');
  }
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

/**
 * Firestore com cache local (RNF-02 / RNF-12): as escritas feitas sem
 * internet ficam na fila e são enviadas quando a conexão volta.
 * - Web: cache persistente em IndexedDB (sobrevive a recarregar a página).
 * - Android/iOS (Expo Go): cache em memória, válido enquanto o app está aberto.
 */
export function getDb(): Firestore {
  if (db) return db;
  const firebaseApp = getFirebaseApp();
  try {
    db = initializeFirestore(firebaseApp, {
      localCache:
        Platform.OS === 'web'
          ? persistentLocalCache({ tabManager: persistentMultipleTabManager() })
          : memoryLocalCache(),
    });
  } catch {
    // Já inicializado (ex.: recarregamento rápido em desenvolvimento).
    db = getFirestore(firebaseApp);
  }
  return db;
}
