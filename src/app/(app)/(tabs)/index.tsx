import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';
import { routes } from '@/core/navigation/routes';

/** Painel (Dashboard) — tela provisória. */
export default function DashboardTab() {
  return (
    <PlaceholderScreen
      title="Dashboard"
      figmaFrame="Dashboard Individual (Terracotta)"
      showBack={false}
      links={[
        { label: '+ Adicionar transação', href: routes.newTransaction },
        { label: 'Ver extrato completo', href: routes.statement },
      ]}
    />
  );
}
