import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';
import { routes } from '@/core/navigation/routes';
import { useAuth } from '@/features/auth/AuthContext';

/** Criar nova conta — tela provisória. */
export default function SignUpRoute() {
  const { signUp } = useAuth();
  return (
    <PlaceholderScreen
      title="Criar sua conta"
      figmaFrame="Criar Nova Conta"
      links={[
        {
          label: 'Criar conta gratuita',
          action: () => signUp({ name: 'Usuário Demo', email: 'demo@moneywise.app', password: '' }),
        },
        { label: 'Já tem uma conta? Entrar', href: routes.signIn, replace: true },
      ]}
    />
  );
}
