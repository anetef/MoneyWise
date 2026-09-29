import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';
import { routes } from '@/core/navigation/routes';

/** Extrato de transações — tela provisória (visual do Figma entra na branch de telas). */
export default function StatementRoute() {
  return (
    <PlaceholderScreen
      title="Extrato de transações"
      figmaFrame="Extrato de Transações"
      links={[
        { label: 'Adicionar transação', href: routes.newTransaction }
      ]}
    />
  );
}
