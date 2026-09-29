import { useEffect } from 'react';

import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';
import { routes } from '@/core/navigation/routes';
import { markOnboardingSeen } from '@/features/auth/onboardingStorage';

/** Onboarding 3 — tela provisória (visual do Figma entra na branch de telas). */
export default function OnboardingStep3() {
  // Chegou ao fim do onboarding: nas próximas vezes, começa em Boas-vindas.
  useEffect(() => {
    markOnboardingSeen();
  }, []);

  return (
    <PlaceholderScreen
      title="Onboarding 3"
      figmaFrame="Onboarding - Passo 3: Finalizar"
      links={[
        { label: 'Criar conta gratuita', href: routes.signUp },
        { label: 'Já tenho uma conta / Entrar', href: routes.signIn }
      ]}
    />
  );
}
