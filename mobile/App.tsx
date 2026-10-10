import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { colors, fontFamily, fontSize, lineHeight, spacing, radius, shadows, typography } from './src/core/theme';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
function AppWithFonts() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded) {
    return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
  }

  return <App />;
}

function App() {
  const avisar = (acao: string) => {
    Alert.alert(
        'MoneyWise',
        `${acao} estará disponível em breve.`,
    );
  };

  return (
      <View style={styles.container}>
        <StatusBar style="dark" />

        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
        >
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandSymbol}>W</Text>
            </View>

            <Text style={styles.brandName}>MoneyWise</Text>
          </View>

          <View style={styles.preview}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Seu dinheiro, organizado</Text>
              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>DEMO</Text>
              </View>
            </View>

            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Saldo atual</Text>
              <Text style={styles.balanceValue}>R$ 14.529,80</Text>
              <Text style={styles.balanceHint}>
                Mais clareza para suas próximas escolhas
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeading}>
                  <View style={styles.smallIcon}>
                    <Text style={styles.smallIconText}>↓</Text>
                  </View>
                  <Text style={styles.summaryLabel}>Entradas</Text>
                </View>

                <Text style={styles.incomeValue}>R$ 8.450,00</Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryHeading}>
                  <View style={styles.smallIcon}>
                    <Text style={styles.smallIconText}>↑</Text>
                  </View>
                  <Text style={styles.summaryLabel}>Saídas</Text>
                </View>

                <Text style={styles.expenseValue}>R$ 6.337,50</Text>
              </View>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalHeading}>
                  <Text style={styles.goalIcon}>◎</Text>
                  <Text style={styles.goalTitle}>Sua próxima conquista</Text>
                </View>
                <Text style={styles.goalPercentage}>75%</Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>

              <View style={styles.goalFooter}>
                <Text style={styles.goalDescription}>Reserva de emergência</Text>
                <Text style={styles.goalAmount}>R$ 7.500</Text>
              </View>
            </View>
          </View>

          <View style={styles.message}>
            <Text style={styles.eyebrow}>CUIDE DO PRESENTE. PLANEJE O FUTURO.</Text>

            <Text style={styles.title}>
              Seu dinheiro.{'\n'}
              <Text style={styles.titleAccent}>Suas possibilidades.</Text>
            </Text>

            <Text style={styles.description}>
              Acompanhe seus gastos, organize suas finanças e transforme
              seus planos em conquistas.
            </Text>
          </View>

          <View style={styles.footer}>
            <Pressable
                accessibilityRole="button"
                onPress={() => avisar('O cadastro')}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
            >
              <Text style={styles.primaryText}>Começar agora</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </Pressable>

            <Pressable
                accessibilityRole="button"
                onPress={() => avisar('O login')}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
            >
              <Text style={styles.secondaryText}>Já tenho uma conta</Text>
            </Pressable>

            <Text style={styles.footerHint}>
              Um passo de cada vez, na direção dos seus objetivos.
            </Text>
          </View>
        </ScrollView>
      </View>
  );
}

export default AppWithFonts;

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.massive,
    paddingBottom: spacing.huge,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxxl,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandSymbol: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold,
  },
  brandName: {
    color: colors.primary,
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.7,
  },
  preview: {
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.xxxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  previewTitle: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semiBold,
  },
  previewBadge: {
    backgroundColor: colors.border.subtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  previewBadgeText: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.bold,
    letterSpacing: 1,
  },
  balanceCard: {
    ...shadows.sm,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  balanceLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
  },
  balanceValue: {
    color: colors.text.primary,
    fontSize: fontSize.display,
    fontFamily: fontFamily.bold,
    letterSpacing: -1,
    marginTop: spacing.sm,
  },
  balanceHint: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  summaryHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  smallIcon: {
    width: 22,
    height: 22,
    borderRadius: radius.md,
    backgroundColor: colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallIconText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
  },
  summaryLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
  },
  incomeValue: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontFamily: fontFamily.semiBold,
    marginTop: spacing.sm,
  },
  expenseValue: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontFamily: fontFamily.semiBold,
    marginTop: spacing.sm,
  },
  goalCard: {
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  goalHeading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  goalIcon: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontFamily: fontFamily.regular,
  },
  goalTitle: {
    flex: 1,
    color: colors.text.primary,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semiBold,
  },
  goalPercentage: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.bold,
  },
  progressTrack: {
    height: 7,
    borderRadius: radius.sm,
    backgroundColor: colors.surface.secondary,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressFill: {
    width: '75%',
    height: '100%',
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  goalDescription: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
  },
  goalAmount: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semiBold,
  },
  message: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxl,
  },
  eyebrow: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.bold,
    letterSpacing: 1.1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    color: colors.text.primary,
    letterSpacing: -1,
    textAlign: 'center',
  },
  titleAccent: {
    color: colors.primary,
  },
  description: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    lineHeight: lineHeight.md,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  primaryButton: {
    minHeight: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  primaryText: {
    ...typography.button,
    color: colors.white,
  },
  buttonArrow: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.regular,
  },
  secondaryButton: {
    minHeight: 52,
    backgroundColor: colors.surface.secondary,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  secondaryText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontFamily: fontFamily.semiBold,
  },
  footerHint: {
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    lineHeight: lineHeight.xs,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.75,
  },
});