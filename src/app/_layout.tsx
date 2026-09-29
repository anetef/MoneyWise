import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/core/theme';
import { useAppFonts } from '@/core/theme/useAppFonts';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';

// Mantém a splash screen visível até a fonte e a sessão estarem prontas.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

/**
 * Decide quais grupos de telas estão liberados (UC01/UC02 — Fluxo de Entrada):
 * - sem sessão → só o grupo (auth): onboarding, boas-vindas, login, cadastro
 * - com sessão → só o grupo (app): abas e telas internas
 *
 * Quando `user` muda (login ou logout), o Expo Router redireciona sozinho
 * para a primeira tela do grupo liberado. Não é preciso chamar router.replace.
 */
function RootNavigator() {
  const fontsReady = useAppFonts();
  const { user, initializing } = useAuth();
  const ready = fontsReady && !initializing;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
