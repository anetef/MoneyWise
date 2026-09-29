import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';
import { useAuth } from '@/features/auth/AuthContext';

/** Meu Perfil — tela provisória. */
export default function ProfileTab() {
  const { signOut } = useAuth();
  return (
    <PlaceholderScreen
      title="Meu perfil"
      figmaFrame="Meu Perfil"
      showBack={false}
      // UC03: ao sair, o layout raiz volta para o fluxo de entrada automaticamente.
      links={[{ label: 'Sair da conta', action: signOut }]}
    />
  );
}
