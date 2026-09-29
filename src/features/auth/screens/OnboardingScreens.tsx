import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Button, IconButton, ProgressRing, Screen, StepDots } from '@/core/components';
import { routes } from '@/core/navigation/routes';
import { colors, radius, shadows, spacing } from '@/core/theme';
import { markOnboardingSeen } from '../onboardingStorage';

const skip = () => router.replace(routes.welcome);

// ---------------------------------------------------------------------------
// Estrutura comum aos 3 passos: topo, ilustração, título, texto, pontos e botões
// ---------------------------------------------------------------------------
function OnboardingLayout({
  top,
  illustration,
  title,
  description,
  step,
  actions,
  titleSize = 'h1',
}: {
  top: ReactNode;
  illustration: ReactNode;
  title: string;
  description: string;
  step: number;
  actions: ReactNode;
  titleSize?: 'h1' | 'h2';
}) {
  return (
    <Screen footer={actions}>
      {top}
      <View style={styles.illustration}>{illustration}</View>
      <AppText
        variant={titleSize === 'h1' ? 'h1' : 'h2'}
        color="textStrong"
        align="center"
        style={titleSize === 'h2' && { fontFamily: 'Inter_700Bold' }}
      >
        {title}
      </AppText>
      <AppText color="textSecondary" align="center" style={styles.description}>
        {description}
      </AppText>
      <View style={styles.dots}>
        <StepDots total={3} active={step} />
      </View>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Passo 1 — "Suas finanças pessoais e coletivas em sintonia"
// ---------------------------------------------------------------------------
export function OnboardingStep1Screen() {
  return (
    <OnboardingLayout
      step={0}
      titleSize="h2"
      title="Suas finanças pessoais e coletivas em sintonia"
      description="Centralize seus gastos diários, compartilhe metas com quem você ama e acompanhe cada centavo com total clareza e autonomia."
      top={
        <View style={styles.topRow}>
          <AppText variant="title" color="textStrong">
            MoneyWise
          </AppText>
          <Pressable onPress={skip} hitSlop={10} accessibilityRole="button">
            <AppText variant="footnote" color="textSecondary">
              Pular
            </AppText>
          </Pressable>
        </View>
      }
      illustration={
        <View style={[styles.mockup, shadows.raised]}>
          <View style={[styles.mockCard, shadows.card]}>
            <AppText style={styles.bigMoney}>
              R$ 12.834
              <AppText variant="title" color="textSecondary">
                ,50
              </AppText>
            </AppText>
            <View style={styles.inline}>
              <MaterialIcons name="swap-horiz" size={14} color={colors.primary} />
              <AppText variant="label" color="primary">
                3 cofrinhos compartilhados ativos
              </AppText>
            </View>
          </View>

          <View style={[styles.mockCard, shadows.card, { gap: spacing.sm }]}>
            <View style={styles.between}>
              <AppText variant="footnote" color="textStrong">
                Divisão do mês
              </AppText>
              <AppText variant="label" color="textSecondary">
                R$ 4.250 total
              </AppText>
            </View>
            <View style={styles.multiBar}>
              <View style={{ flex: 46, backgroundColor: colors.success }} />
              <View style={{ flex: 32, backgroundColor: colors.successLight }} />
              <View style={{ flex: 22, backgroundColor: colors.dot }} />
            </View>
            <View style={styles.legend}>
              {[
                ['Moradia', '46%', colors.success],
                ['Alimentação', '32%', colors.successLight],
                ['Transporte', '22%', colors.dot],
              ].map(([label, pct, color]) => (
                <View key={label} style={styles.legendItem}>
                  <View style={styles.inline}>
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <AppText variant="label" color="textSecondary">
                      {label}
                    </AppText>
                  </View>
                  <AppText variant="footnote" color="textStrong">
                    {pct}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.mockCard, shadows.card, styles.feed]}>
            <MiniRow icon="cart-outline" title="Mercado Semanal" subtitle="Dividido igualmente" value="- R$ 342,80" />
            <MiniRow
              icon="piggy-bank-outline"
              title="Aporte Caixinha Viagem"
              subtitle="Mari & Você"
              value="+ R$ 500,00"
              positive
            />
          </View>
        </View>
      }
      actions={
        <Button title="Continuar" trailingIcon="arrow-forward" onPress={() => router.push(routes.onboarding2)} />
      }
    />
  );
}

function MiniRow({
  icon,
  title,
  subtitle,
  value,
  positive,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <View style={[styles.between, { padding: 4 }]}>
      <View style={[styles.inline, { gap: spacing.sm }]}>
        <View style={styles.miniIcon}>
          <MaterialCommunityIcons name={icon} size={16} color={colors.white} />
        </View>
        <View>
          <AppText variant="footnote" color="textStrong">
            {title}
          </AppText>
          <AppText variant="label" color="textSecondary">
            {subtitle}
          </AppText>
        </View>
      </View>
      <AppText variant="footnote" color={positive ? 'primary' : 'textStrong'} style={styles.semibold}>
        {value}
      </AppText>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Passo 2 — "Caixinhas para cada objetivo da sua vida"
// ---------------------------------------------------------------------------
export function OnboardingStep2Screen() {
  const [tab, setTab] = useState<'individual' | 'shared'>('shared');

  return (
    <OnboardingLayout
      step={1}
      title="Caixinhas para cada objetivo da sua vida"
      description="Guarde dinheiro individualmente ou em grupo com regras claras, foco total e transparência em tempo real."
      top={
        <View style={styles.topRow}>
          <IconButton icon="arrow-back" variant="tint" accessibilityLabel="Voltar" onPress={() => router.back()} />
          <AppText variant="title" color="textStrong">
            MoneyWise
          </AppText>
          <Pressable onPress={skip} hitSlop={10} accessibilityRole="button">
            <AppText variant="button" color="textSecondary">
              Pular
            </AppText>
          </Pressable>
        </View>
      }
      illustration={
        <View style={[styles.mockup, styles.mockupRounded, shadows.card]}>
          <View style={styles.segment}>
            {(['individual', 'shared'] as const).map((key) => {
              const active = tab === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setTab(key)}
                  style={[styles.segmentItem, active && [styles.segmentActive, shadows.card]]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                >
                  <AppText variant="footnote" color={active ? 'primary' : 'textSecondary'}>
                    {key === 'individual' ? 'Individuais' : 'Coletivas'}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.goalCard, shadows.card]}>
            <View style={styles.between}>
              <View style={[styles.inline, { gap: spacing.md, flex: 1 }]}>
                <View style={styles.goalIcon}>
                  <MaterialCommunityIcons name="airplane-takeoff" size={20} color={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="title" color="textStrong" style={{ letterSpacing: -0.18 }}>
                    {tab === 'shared' ? 'Viagem Japão 2025' : 'Reserva Pessoal'}
                  </AppText>
                  <AppText variant="footnote" color="textSecondary" style={styles.regular}>
                    Meta até Dezembro
                  </AppText>
                </View>
              </View>
              <ProgressRing size={48} strokeWidth={4} progress={0.65} trackColor={colors.surfaceTintStrong}>
                <AppText variant="label" color="primary" style={styles.bold}>
                  65%
                </AppText>
              </ProgressRing>
            </View>
            <View style={[styles.between, { marginTop: spacing.lg, alignItems: 'flex-end' }]}>
              <View>
                <AppText variant="footnote" color="textSecondary" style={styles.regular}>
                  Total acumulado
                </AppText>
                <AppText style={styles.mediumMoney}>R$ 9.750</AppText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <AppText variant="footnote" color="textSecondary" style={styles.regular}>
                  Objetivo final
                </AppText>
                <AppText variant="button" color="textSecondary">
                  R$ 15.000
                </AppText>
              </View>
            </View>
            {tab === 'shared' && (
              <View style={styles.membersRow}>
                <View style={styles.inline}>
                  {['Mariana Costa', 'Pedro Alves', 'Julia Rocha'].map((n, i) => (
                    <View key={n} style={{ marginLeft: i ? -8 : 0 }}>
                      <Avatar name={n} size={28} ring />
                    </View>
                  ))}
                  <View style={[styles.more, { marginLeft: -8 }]}>
                    <AppText variant="label" color="textStrong" style={styles.bold}>
                      +2
                    </AppText>
                  </View>
                </View>
                <AppText variant="label" color="textSecondary">
                  5 membros ativos
                </AppText>
              </View>
            )}
          </View>

          <View style={[styles.smallGoal, shadows.card]}>
            <View style={[styles.inline, { gap: spacing.md }]}>
              <View style={[styles.goalIcon, { width: 36, height: 36, borderRadius: radius.sm }]}>
                <MaterialCommunityIcons name="compass-outline" size={18} color={colors.white} />
              </View>
              <View>
                <AppText variant="button" color="textStrong">
                  Reforma do Apê
                </AppText>
                <AppText variant="footnote" color="textSecondary" style={styles.regular}>
                  R$ 4.200 de R$ 8.000
                </AppText>
              </View>
            </View>
            <View style={styles.chevron}>
              <MaterialIcons name="chevron-right" size={20} color={colors.white} />
            </View>
          </View>
        </View>
      }
      actions={
        <>
          <Button title="Continuar" trailingIcon="arrow-forward" onPress={() => router.push(routes.onboarding3)} />
          <Button title="Voltar" variant="ghost" onPress={() => router.back()} style={{ height: 38 }} />
        </>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Passo 3 — "Tudo pronto para transformar suas metas"
// ---------------------------------------------------------------------------
export function OnboardingStep3Screen() {
  useEffect(() => {
    markOnboardingSeen();
  }, []);

  return (
    <OnboardingLayout
      step={2}
      title="Tudo pronto para transformar suas metas"
      description="Comece a planejar e poupar com quem você confia, ou construa seus objetivos individuais com clareza total."
      top={
        <View style={[styles.topRow, { height: 56, paddingVertical: 0 }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Voltar">
            <MaterialIcons name="arrow-back-ios-new" size={20} color={colors.textStrong} />
          </Pressable>
          <AppText variant="title" color="textStrong">
            MoneyWise
          </AppText>
          <View style={{ width: 20 }} />
        </View>
      }
      illustration={
        <View style={[styles.finalCard, shadows.raised]}>
          <View style={styles.highlight}>
            <View style={styles.between}>
              <View style={[styles.inline, { gap: spacing.sm }]}>
                <MaterialCommunityIcons name="airplane-takeoff" size={18} color={colors.primary} />
                <AppText variant="button" color="textStrong">
                  Viagem em Grupo
                </AppText>
              </View>
              <AppText variant="footnote" color="primary" style={styles.semibold}>
                100%
              </AppText>
            </View>
            <View style={styles.fullBar} />
            <View style={styles.between}>
              <AppText variant="label" color="textSecondary">
                Meta alcançada em equipe
              </AppText>
              <AppText variant="label" color="success" style={{ fontFamily: 'Inter_500Medium' }}>
                Concluída
              </AppText>
            </View>
          </View>
          {['Visão de extratos em tempo real', 'Divisão justa de metas e aportes', 'Sem taxas nem complicação'].map(
            (item) => (
              <View key={item} style={[styles.inline, { gap: spacing.md }]}>
                <View style={styles.check}>
                  <MaterialIcons name="check" size={15} color={colors.white} />
                </View>
                <AppText color="textStrong">{item}</AppText>
              </View>
            ),
          )}
        </View>
      }
      actions={
        <>
          <Button title="Criar conta gratuita" trailingIcon="arrow-forward" onPress={() => router.push(routes.signUp)} />
          <Button title="Já tenho uma conta / Entrar" variant="secondary" onPress={() => router.push(routes.signIn)} />
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  illustration: { paddingVertical: spacing.lg },
  description: { marginTop: spacing.xs, maxWidth: 330, alignSelf: 'center' },
  dots: { paddingTop: spacing.xl, paddingBottom: spacing.sm },
  mockup: { backgroundColor: colors.surfaceTint, borderRadius: radius.md, padding: spacing.lg, gap: spacing.lg },
  mockupRounded: { borderRadius: radius.lg, gap: spacing.sm },
  mockCard: { backgroundColor: colors.surface, borderRadius: radius.sm, padding: spacing.lg, gap: 4 },
  feed: { padding: spacing.sm },
  bigMoney: { fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 38, letterSpacing: -0.8, color: colors.textStrong },
  mediumMoney: { fontFamily: 'Inter_600SemiBold', fontSize: 24, lineHeight: 30, letterSpacing: -0.6, color: colors.textStrong },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  multiBar: { flexDirection: 'row', height: 12, gap: 2, borderRadius: radius.pill, overflow: 'hidden' },
  legend: { flexDirection: 'row', paddingTop: 4 },
  legendItem: { flex: 1, gap: 2 },
  dot: { width: 8, height: 8, borderRadius: radius.pill },
  miniIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  semibold: { fontFamily: 'Inter_600SemiBold' },
  bold: { fontFamily: 'Inter_700Bold' },
  regular: { fontFamily: 'Inter_400Regular' },
  segment: { flexDirection: 'row', backgroundColor: colors.surfaceTintStrong, borderRadius: radius.md, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.surface },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    overflow: 'hidden',
  },
  goalIcon: {
    width: 36,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: 4,
    paddingBottom: spacing.xs,
    backgroundColor: 'rgba(239,244,255,0.6)',
  },
  more: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: '#D3E4FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  smallGoal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.xl, gap: spacing.lg },
  highlight: { backgroundColor: colors.surfaceTint, borderRadius: radius.sm, padding: spacing.lg, gap: 8 },
  fullBar: { height: 8, borderRadius: radius.pill, backgroundColor: colors.primary },
  check: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
