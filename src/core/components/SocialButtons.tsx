import { FontAwesome } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '@/core/theme';
import { showMessage } from '@/core/utils/feedback';
import { AppText } from './AppText';

/**
 * Botões "Apple" e "Google" do Figma.
 * O login social ainda não está no escopo (RF-01 prevê e-mail/senha),
 * então por enquanto eles só avisam que a função chega em breve.
 */
export function SocialButtons({ tone = 'tint' }: { tone?: 'tint' | 'surface' }) {
  const bg = tone === 'tint' ? colors.surfaceTint : colors.surface;
  const soon = (provider: string) =>
    showMessage(`Entrar com ${provider}`, 'Em breve! Por enquanto, use seu e-mail e senha.');

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        onPress={() => soon('Apple')}
        style={({ pressed }) => [styles.button, { backgroundColor: bg }, shadows.card, pressed && styles.pressed]}
      >
        <FontAwesome name="apple" size={18} color={colors.textStrong} />
        <AppText variant="footnote" color="textStrong">
          Apple
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => soon('Google')}
        style={({ pressed }) => [styles.button, { backgroundColor: bg }, shadows.card, pressed && styles.pressed]}
      >
        <FontAwesome name="google" size={17} color="#4285F4" />
        <AppText variant="footnote" color="textStrong">
          Google
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  button: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pressed: { opacity: 0.8 },
});
