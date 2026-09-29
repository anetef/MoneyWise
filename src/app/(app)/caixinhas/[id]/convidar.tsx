import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';

/** Convidar membros — tela provisória. */
export default function GoalInviteRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaceholderScreen title="Convidar membros" figmaFrame={`Convidar Membros · caixinha ${id}`} />;
}
