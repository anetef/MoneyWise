import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { AppText, Button, Screen, SocialButtons, TextDivider } from '@/core/components';
import { routes } from '@/core/navigation/routes';
import { colors, radius, shadows, spacing } from '@/core/theme';
import { markOnboardingSeen } from '../onboardingStorage';

/** Figma: "Boas-vindas - Entrar ou Cadastrar" */
export function WelcomeScreen() {
  useEffect(() => {
    markOnboardingSeen();
  }, []);

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.handle} />

      <View style={[styles.hero, shadows.card]}>
        <Image
          source={require('../../../../assets/images/welcome-hero.png')}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={[styles.heroBadge, shadows.card]}>
          <View style={styles.heroBadgeIcon}>
            <MaterialIcons name="trending-up" size={14} color={colors.white} />
          </View>
          <View>
            <AppText variant="label" color="textBody">
              Meta Coletiva
            </AppText>
            <AppText variant="headline" color="textStrong">
              R$ 18.450 guardados
            </AppText>
          </View>
        </View>
      </View>

      <AppText variant="h2" color="textStrong" align="center" style={styles.title}>
        Bem-vindo ao MoneyWise
      </AppText>
      <AppText color="textBody" align="center" style={styles.subtitle}>
        Controle suas finanças pessoais e construa metas compartilhadas sem complicação.
      </AppText>

      <View style={styles.actions}>
        <Button title="Criar nova conta" trailingIcon="arrow-forward" onPress={() => router.push(routes.signUp)} />
        <Button title="Entrar na minha conta" variant="secondary" onPress={() => router.push(routes.signIn)} />
      </View>

      <View style={styles.social}>
        <TextDivider label="ou continue com" />
        <SocialButtons />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm },
  handle: {
    alignSelf: 'center',
    width: 32,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTint,
    marginBottom: spacing.lg,
  },
  hero: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
    aspectRatio: 4 / 3,
    backgroundColor: colors.surfaceTintStrong,
    borderRadius: radius.md,
    padding: spacing.sm,
    overflow: 'hidden',
  },
  heroImage: { flex: 1, width: '100%', borderRadius: radius.sm },
  heroBadge: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  heroBadgeIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: spacing.xl + spacing.sm },
  subtitle: { marginTop: spacing.sm, maxWidth: 320, alignSelf: 'center' },
  actions: { marginTop: spacing.xl, gap: spacing.sm },
  social: { marginTop: spacing.lg, gap: spacing.lg },
});
