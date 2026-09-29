import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@moneywise/onboarding-visto';

/** Marca que a pessoa já passou pelo onboarding (para não mostrar de novo). */
export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, '1');
  } catch {
    // Sem armazenamento disponível: apenas mostra o onboarding novamente.
  }
}

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === '1';
  } catch {
    return false;
  }
}
