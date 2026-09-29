import { Stack } from 'expo-router';

import { colors } from '@/core/theme';

/** Pilha de telas do fluxo de entrada (usuário não autenticado). */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="onboarding/passo-1" options={{ animation: 'fade' }} />
      <Stack.Screen name="onboarding/passo-2" />
      <Stack.Screen name="onboarding/passo-3" />
      <Stack.Screen name="boas-vindas" options={{ animation: 'fade' }} />
      <Stack.Screen name="entrar" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="recuperar-senha" />
    </Stack>
  );
}
