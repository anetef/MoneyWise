import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, SegmentedControl, TopBar } from '@/core/components';
import { colors, radius, shadows, spacing } from '@/core/theme';
import { formatCurrency } from '@/core/utils/format';
import { showMessage } from '@/core/utils/feedback';
import { EntryItem } from '../components/EntryItem';
import type { GoalEntry } from '../types';
import { useGoal } from '../useGoals';

type Filter = 'all' | 'in' | 'out';

function dayLabel(date: Date) {
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((start(new Date()) - start(date)) / 86_400_000);
  const month = date.toLocaleDateString('pt-BR', { month: 'long' });
  const pretty = `${date.getDate()} de ${month.charAt(0).toUpperCase()}${month.slice(1)}`;
  if (diff === 0) return `Hoje, ${pretty}`;
  if (diff === 1) return `Ontem, ${pretty}`;
  return `${pretty} de ${date.getFullYear()}`;
}

/** Figma: "Extrato da Caixinha" — RF-14 (histórico de contribuições) */
export function GoalStatementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goal, entries } = useGoal(id);
  const [filter, setFilter] = useState<Filter>('all');
  const [memberId, setMemberId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = entries.filter(
    (e) =>
      (filter === 'all' || (filter === 'out' ? e.type === 'withdraw' : e.type !== 'withdraw')) &&
      (!memberId || e.userId === memberId),
  );

  const groups = useMemo(() => {
    const map = new Map<string, GoalEntry[]>();
    for (const e of filtered) map.set(e.date.toDateString(), [...(map.get(e.date.toDateString()) ?? []), e]);
    return [...map.values()];
  }, [filtered]);

  async function handleDownload() {
    if (!goal) return;
    const lines = filtered.map(
      (e) =>
        `${e.date.toLocaleDateString('pt-BR')}  ${e.userName}  ${e.description}  ${e.type === 'withdraw' ? '-' : '+'}${formatCurrency(e.amount)}`,
    );
    try {
      await Share.share({
        title: `Caixinha ${goal.name}`,
        message: `Caixinha ${goal.name}\nSaldo: ${formatCurrency(goal.savedAmount)} de ${formatCurrency(goal.targetAmount)}\n\n${lines.join('\n')}`,
      });
    } catch {
      showMessage('Não foi possível compartilhar.');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar title="Todos os registros" backColor={colors.primary} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balance}>
          <AppText variant="headline" color="textMuted">
            Saldo Acumulado
          </AppText>
          <AppText style={styles.balanceValue}>{formatCurrency(goal?.savedAmount ?? 0)}</AppText>
        </View>

        <SegmentedControl<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Tudo' },
            { value: 'in', label: 'Entradas' },
            { value: 'out', label: 'Saídas' },
          ]}
        />

        <View style={styles.actions}>
          <Pressable onPress={handleDownload} style={[styles.action, { backgroundColor: colors.primary }]} accessibilityRole="button">
            <MaterialIcons name="file-download" size={18} color={colors.white} />
            <AppText variant="headline" style={{ color: colors.white }}>
              Baixar
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => setShowFilters((s) => !s)}
            disabled={!goal?.shared}
            style={[styles.action, { backgroundColor: '#EFE0D6', opacity: goal?.shared ? 1 : 0.6 }]}
            accessibilityRole="button"
          >
            <MaterialIcons name="filter-list" size={18} color="#6D625B" />
            <AppText variant="headline" style={{ color: '#6D625B' }}>
              Filtros{memberId ? ' (1)' : ''}
            </AppText>
          </Pressable>
        </View>

        {showFilters && goal?.shared && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {goal.members.map((m) => {
              const active = m.id === memberId;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setMemberId(active ? null : m.id)}
                  style={[styles.chip, active && { backgroundColor: colors.primary }]}
                >
                  <AppText variant="footnote" style={{ color: active ? colors.white : colors.textMuted }}>
                    {m.name.split(' ')[0]}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {groups.length === 0 && (
          <AppText color="textMuted" align="center">
            Nenhum registro encontrado.
          </AppText>
        )}

        {groups.map((group) => (
          <View key={group[0]!.date.toDateString()} style={{ gap: spacing.sm }}>
            <AppText variant="headline" color="textMuted" style={{ paddingLeft: spacing.lg }}>
              {dayLabel(group[0]!.date)}
            </AppText>
            <View style={[styles.list, shadows.card]}>
              {group.map((e, i) => (
                <View key={e.id}>
                  {i > 0 && <View style={styles.divider} />}
                  <EntryItem entry={e} showAuthor={!!goal?.shared} />
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  balance: { alignItems: 'center', gap: 4 },
  balanceValue: { fontFamily: 'Inter_700Bold', fontSize: 34, lineHeight: 41, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  chips: { gap: spacing.sm, marginTop: -spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.chip },
  list: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 64 },
});
