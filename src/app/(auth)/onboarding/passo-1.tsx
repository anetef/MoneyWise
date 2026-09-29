import { PlaceholderScreen } from '@/core/navigation/PlaceholderScreen';
import { routes } from '@/core/navigation/routes';

/** Onboarding 1 — tela provisória (visual do Figma entra na branch de telas). */
export default function OnboardingStep1() {
  return (
    <PlaceholderScreen
      title="Onboarding 1"
      figmaFrame="Onboarding - Passo 1"
      showBack={false}
      links={[
        { label: 'Continuar', href: routes.onboarding2 },
        { label: 'Pular', href: routes.welcome, replace: true }
      ]}
    />
  );
}
