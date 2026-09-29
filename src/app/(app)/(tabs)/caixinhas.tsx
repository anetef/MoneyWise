import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';
import { routes } from '@/core/navigation/routes';

/** Caixinhas — tela provisória (visual do Figma entra na branch de telas). */
export default function GoalsTab() {
  return (
    <PlaceholderScreen
      title="Caixinhas"
      figmaFrame="Caixinhas - Lista"
      showBack={false}
      links={[
        { label: 'Abrir caixinha compartilhada', href: routes.goalDetails('demo-compartilhada') },
        { label: 'Abrir caixinha individual', href: routes.goalDetails('demo-individual') },
        { label: 'Nova caixinha', href: routes.newGoal }
      ]}
    />
  );
}
