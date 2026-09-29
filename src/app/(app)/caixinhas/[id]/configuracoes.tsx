import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';

/** Configurações da caixinha — tela provisória. */
export default function GoalSettingsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaceholderScreen title="Configurações da caixinha" figmaFrame={`Caixinha - Configurações · caixinha ${id}`} />;
}
