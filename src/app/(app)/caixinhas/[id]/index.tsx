import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';
import { routes } from '@/core/navigation/routes';

/** Detalhes da caixinha — tela provisória. O `id` vem da URL: /caixinhas/<id>. */
export default function GoalDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const shared = id.includes('compartilhada');
  return (
    <PlaceholderScreen
      title={`Caixinha ${id}`}
      figmaFrame={shared ? 'Caixinha - Detalhes (Compartilhada)' : 'Caixinha - Detalhes Individual'}
      links={[
        { label: 'Ver extrato da caixinha', href: routes.goalStatement(id) },
        { label: 'Configurações', href: routes.goalSettings(id) },
        ...(shared ? [{ label: 'Convidar membros', href: routes.goalInvite(id) }] : []),
      ]}
    />
  );
}
