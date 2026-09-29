import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';

/** Extrato da caixinha — tela provisória. */
export default function GoalStatementRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaceholderScreen title="Extrato da caixinha" figmaFrame={`Extrato da Caixinha · caixinha ${id}`} />;
}
