import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';
import { routes } from '@/core/navigation/routes';

/** Recuperar senha — tela provisória (visual do Figma entra na branch de telas). */
export default function ForgotPasswordRoute() {
  return (
    <PlaceholderScreen
      title="Recuperar senha"
      figmaFrame="Recuperar Senha"
      links={[
        { label: 'Voltar para o login', href: routes.signIn, replace: true }
      ]}
    />
  );
}
