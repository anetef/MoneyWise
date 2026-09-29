import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';

/** Carrega a fonte Inter nos 4 pesos usados no Figma. Retorna `true` quando pronta. */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  // Se a fonte falhar (ex.: sem internet no web), seguimos com a fonte do sistema.
  return loaded || !!error;
}
