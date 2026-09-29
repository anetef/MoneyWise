import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Avatar, ProgressBar, ProgressRing, TopBar } from '@/core/components';
import { routes } from '@/core/navigation/routes';
import { colors, radius, shadows, spacing } from '@/core/theme';
import { formatCurrency } from '@/core/utils/format';
import { useCurrentUser } from '@/features/auth/AuthContext';
import { EntryItem } from '../components/EntryItem';
import { EntrySheet } from '../components/EntrySheet';
import { levelStyles, ThermometerCard } from '../components/ThermometerCard';
import type { GoalEntryType } from '../types';
import { useGoal } from '../useGoals';

/**
 * Figma: "Caixinha - Detalhes (Compartilhada)" e "Caixinha - Detalhes Individual".
 * RF-13 (aportes), RF-14 (contribuições por membro), RF-17/18/19 (termômetro em tempo real).
 */
export function GoalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useCurrentUser();
  const { goal, entries, loading, isAdmin, thermometer, addEntry } = useGoal(id);
  const [sheet, setSheet] = useState<GoalEntryType | null>(null);

  if (loading || !goal || !thermometer) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="Detalhes da caixinha" backColor={colors.primary} />
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 80 }} />
        ) : (
          <AppText color="textMuted" align="center" style={{ marginTop: 80 }}>
            Caixinha não encontrada ou você não participa dela.
          </AppText>
        )}
      </SafeAreaView>
    );
  }

  const pct = Math.round(thermometer.progress * 100);
  const level = levelStyles[thermometer.level];
  const recent = entries.slice(0, 4);
  const total = goal.savedAmount || 1;

  const settingsButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Configurações da caixinha"
      onPress={() => router.push(routes.goalSettings(goal.id))}
      style={styles.settings}
    >
      <MaterialCommunityIcons name="tune-variant" size={20} color={colors.white} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="Detalhes da caixinha" backColor={colors.primary} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {goal.shared ? (
          // ---------------- Caixinha compartilhada ----------------
          <View style={styles.sharedHero}>
            <View style={[styles.blob, styles.blobTop]} />
            <View style={[styles.blob, styles.blobBottom]} />
            <View style={styles.between}>
              <View style={{ flex: 1 }}>
                <AppText style={styles.heroTitle}>{goal.name}</AppText>
                <View style={styles.inline}>
                  <MaterialCommunityIcons name={goal.icon} size={18} color={colors.textMuted} />
                  <AppText variant="bodyLarge" color="textMuted">
                    Caixinha compartilhada
                  </AppText>
                </View>
              </View>
              {settingsButton}
            </View>

            <View style={styles.ringWrap}>
              <ProgressRing size={200} strokeWidth={18} progress={thermometer.progress} color={level.fg}>
                <AppText style={styles.ringPct}>{pct}%</AppText>
                <AppText variant="caption" color="textMuted" align="center">
                  {formatCurrency(goal.savedAmount)}
                </AppText>
                <AppText variant="caption" color="textMuted" align="center">
                  de {formatCurrency(goal.targetAmount)}
                </AppText>
              </ProgressRing>
            </View>

            <View style={styles.actions}>
              <ActionButton label="Aporte" icon="add" primary onPress={() => setSheet('deposit')} />
              <ActionButton
                label="Convidar"
                icon="ios-share"
                onPress={() => (isAdmin ? router.push(routes.goalInvite(goal.id)) : router.push(routes.goalSettings(goal.id)))}
              />
            </View>
          </View>
        ) : (
          // ---------------- Caixinha individual ----------------
          <View style={{ gap: spacing.lg }}>
            <View style={styles.between}>
              <View style={[styles.inline, { gap: spacing.md, flex: 1 }]}>
                <View style={styles.squareIcon}>
                  <MaterialCommunityIcons name={goal.icon} size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.heroTitle}>{goal.name}</AppText>
                  <View style={styles.badge}>
                    <AppText variant="caption" color="primary">
                      Meta Pessoal
                    </AppText>
                  </View>
                </View>
              </View>
              {settingsButton}
            </View>

            <View style={[styles.balanceCard, shadows.card]}>
              <View style={styles.between}>
                <AppText variant="overline" color="textMuted" style={{ fontSize: 12 }}>
                  Saldo acumulado
                </AppText>
                <View style={styles.pctChip}>
                  <View style={styles.pctDot} />
                  <AppText variant="caption" color="primary">
                    {pct}% da meta
                  </AppText>
                </View>
              </View>
              <AppText style={styles.balanceValue}>{formatCurrency(goal.savedAmount)}</AppText>
              <ProgressBar progress={thermometer.progress} height={12} />
              <View style={[styles.between, { marginTop: spacing.sm }]}>
                <AppText variant="caption" color="textMuted">
                  Faltam {formatCurrency(thermometer.remaining)}
                </AppText>
                <AppText variant="caption" style={{ fontFamily: 'Inter_600SemiBold', color: colors.text }}>
                  Meta: {formatCurrency(goal.targetAmount)}
                </AppText>
              </View>
            </View>

            <View style={styles.actions}>
              <ActionButton label="Registrar Entrada" icon="add" primary onPress={() => setSheet('deposit')} />
              <ActionButton label="Registrar Retirada" icon="remove" onPress={() => setSheet('withdraw')} />
            </View>
          </View>
        )}

        <ThermometerCard thermometer={thermometer} />

        {goal.shared && (
          <View style={styles.section}>
            <View style={styles.between}>
              <AppText variant="headline">Contribuições</AppText>
              {isAdmin && (
                <Pressable onPress={() => router.push(routes.goalInvite(goal.id))} hitSlop={8}>
                  <AppText variant="caption" color="primary">
                    Convidar
                  </AppText>
                </Pressable>
              )}
            </View>
            <View style={[styles.list, shadows.card]}>
              {goal.members.map((m, i) => (
                <View key={m.id}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.memberRow}>
                    <Avatar name={m.name} size={40} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="bodyLarge">
                        {m.name.split(' ')[0]}
                        {m.id === user.id ? ' (Você)' : ''}
                      </AppText>
                      <AppText variant="caption" color="textMuted">
                        {m.role === 'admin' ? 'Admin' : 'Membro'}
                      </AppText>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <AppText variant="headline">{formatCurrency(m.contributed)}</AppText>
                      <AppText variant="caption" color="textMuted">
                        {Math.round((Math.max(m.contributed, 0) / total) * 100)}% do total
                      </AppText>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.between}>
            <AppText variant={goal.shared ? 'headline' : 'overline'} color={goal.shared ? 'text' : 'textMuted'}>
              {goal.shared ? 'Registros' : 'Histórico de registros'}
            </AppText>
            <Pressable onPress={() => router.push(routes.goalStatement(goal.id))} hitSlop={8}>
              <AppText variant="caption" color="textMuted">
                Ver todos
              </AppText>
            </Pressable>
          </View>
          <View style={[styles.list, shadows.card]}>
            {recent.length === 0 && (
              <AppText variant="callout" color="textMuted" align="center" style={{ padding: spacing.xl }}>
                Nenhum registro ainda. Faça o primeiro aporte!
              </AppText>
            )}
            {recent.map((e, i) => (
              <View key={e.id}>
                {i > 0 && <View style={styles.divider} />}
                <EntryItem entry={e} showAuthor={goal.shared} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <EntrySheet
        visible={sheet !== null}
        type={sheet ?? 'deposit'}
        balance={goal.savedAmount}
        onClose={() => setSheet(null)}
        onSubmit={addEntry}
      />
    </SafeAreaView>
  );
}

function ActionButton({
  label,
  icon,
  primary,
  onPress,
}: {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  primary?: boolean;
  onPress: () => void;
}) {
  const fg = primary ? colors.white : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: primary ? colors.primary : '#EFE0D6' },
        primary && shadows.card,
        pressed && { opacity: 0.85 },
      ]}
    >
      <MaterialIcons name={icon} size={20} color={fg} />
      <AppText variant="headline" style={{ color: fg }} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sharedHero: {
    backgroundColor: '#F2F0F2',
    borderRadius: 24,
    padding: spacing.lg,
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    paddingTop: spacing.xl,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: 'hidden',
  },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(160,82,45,0.08)' },
  blobTop: { width: 220, height: 220, right: -80, top: -20 },
  blobBottom: { width: 160, height: 160, left: -90, bottom: 20 },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 30, color: colors.text },
  settings: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: { alignItems: 'center', paddingVertical: spacing.xl },
  ringPct: { fontFamily: 'Inter_700Bold', fontSize: 28, lineHeight: 34, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.md },
  action: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
  },
  squareIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: '#EFE0D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  balanceCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, gap: spacing.sm },
  pctChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: '#F2E3D9',
  },
  pctDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  balanceValue: { fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 40, color: colors.text, marginBottom: spacing.sm },
  section: { gap: spacing.sm },
  list: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
});
