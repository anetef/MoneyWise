import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { routes } from '@/core/navigation/routes';
import { hasSeenOnboarding } from '@/features/auth/onboardingStorage';

/**
 * Porta de entrada para quem não está logado:
 * - primeira vez no app → onboarding
 * - já viu o onboarding (ex.: depois de sair da conta) → boas-vindas
 */
export default function AuthIndex() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    hasSeenOnboarding().then(setSeen);
  }, []);

  if (seen === null) return null;
  return <Redirect href={seen ? routes.welcome : routes.onboarding1} />;
}
