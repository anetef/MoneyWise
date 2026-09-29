import { useEffect } from 'react';

import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';
import { routes } from '@/core/navigation/routes';
import { markOnboardingSeen } from '@/features/auth/onboardingStorage';

/** Boas-vindas — tela provisória (visual do Figma entra na branch de telas). */
export default function WelcomeRoute() {
  // Chegou ao fim do onboarding: nas próximas vezes, começa em Boas-vindas.
  useEffect(() => {
    markOnboardingSeen();
  }, []);

  return (
    <PlaceholderScreen
      title="Boas-vindas"
      figmaFrame="Boas-vindas - Entrar ou Cadastrar"
      showBack={false}
      links={[
        { label: 'Criar nova conta', href: routes.signUp },
        { label: 'Entrar na minha conta', href: routes.signIn }
      ]}
    />
  );
}
