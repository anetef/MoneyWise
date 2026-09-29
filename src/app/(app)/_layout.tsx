import { Stack } from 'expo-router';

import { colors } from '@/core/theme';

/**
 * Pilha do app logado: as abas ficam na base e as demais telas
 * (extrato, detalhes da caixinha, formulários) abrem por cima delas.
 */
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="extrato" />
      {/* Formulários abrem como modal (de baixo para cima), como no iOS. */}
      <Stack.Screen name="transacao/nova" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="caixinhas/nova" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="caixinhas/[id]/index" />
      <Stack.Screen name="caixinhas/[id]/extrato" />
      <Stack.Screen name="caixinhas/[id]/configuracoes" />
      <Stack.Screen name="caixinhas/[id]/convidar" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
