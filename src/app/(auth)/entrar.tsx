import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';
import { routes } from '@/core/navigation/routes';
import { useAuth } from '@/features/auth/AuthContext';

/** Entrar na conta — tela provisória. */
export default function SignInRoute() {
  const { signIn } = useAuth();
  return (
    <PlaceholderScreen
      title="Entrar na conta"
      figmaFrame="Entrar na Conta"
      links={[
        // Ao logar, o layout raiz troca para o grupo (app) automaticamente.
        { label: 'Entrar na conta', action: () => signIn({ email: 'demo@moneywise.app', password: '' }) },
        { label: 'Esqueci minha senha', href: routes.forgotPassword },
        { label: 'Criar nova conta', href: routes.signUp, replace: true },
      ]}
    />
  );
}
