import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';
import { routes } from '@/core/navigation/routes';

/** Onboarding 2 — tela provisória (visual do Figma entra na branch de telas). */
export default function OnboardingStep2() {
  return (
    <PlaceholderScreen
      title="Onboarding 2"
      figmaFrame="Onboarding - Passo 2"
      links={[
        { label: 'Continuar', href: routes.onboarding3 },
        { label: 'Pular', href: routes.welcome, replace: true }
      ]}
    />
  );
}
