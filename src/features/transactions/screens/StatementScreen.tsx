import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, SegmentedControl, TopBar } from '@/core/components';
import { routes } from '@/core/navigation/routes';
import { colors, radius, shadows, spacing } from '@/core/theme';
import { formatCurrency, formatSignedCurrency } from '@/core/utils/format';
import { showMessage } from '@/core/utils/feedback';
import { categories, getCategory } from '../categories';
import { ItemDivider, TransactionItem } from '../components/TransactionItem';
import type { Transaction } from '../types';
import { useTransactions } from '../useTransactions';

type Filter = 'all' | 'income' | 'expense';

function dayLabel(date: Date, now = new Date()) {
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((start(now) - start(date)) / 86_400_000);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const month = cap(date.toLocaleDateString('pt-BR', { month: 'long' }));
  const pretty = `${date.getDate()} de ${month}`;
  if (diff === 0) return `Hoje, ${pretty}`;
  if (diff === 1) return `Ontem, ${pretty}`;
  const weekday = cap(date.toLocaleDateString('pt-BR', { weekday: 'long' }));
  return `${weekday}, ${pretty}`;
}

/** Figma: "Extrato de Transações" — RF-08 (filtro por categoria e data), RF-22 */
export function StatementScreen() {
  const { items, summary, loading } = useTransactions();
  const [filter, setFilter] = useState<Filter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      items.filter(
        (tx) => (filter === 'all' || tx.type === filter) && (!categoryId || tx.categoryId === categoryId),
      ),
    [items, filter, categoryId],
  );

  // Agrupa por dia, mantendo a ordem (mais recente primeiro).
  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const key = tx.date.toDateString();
      map.set(key, [...(map.get(key) ?? []), tx]);
    }
    return [...map.values()];
  }, [filtered]);

  async function handleDownload() {
    // RF-24/RF-26 preveem PDF; por enquanto compartilhamos um resumo em texto.
    const lines = filtered.map(
      (tx) =>
        `${tx.date.toLocaleDateString('pt-BR')}  ${tx.description || getCategory(tx.categoryId).label}  ${formatSignedCurrency(tx.amount, tx.type)}`,
    );
    const text = `Extrato MoneyWise\nSaldo: ${formatCurrency(summary.balance)}\n\n${lines.join('\n')}`;
    try {
      await Share.share({ message: text, title: 'Extrato MoneyWise' });
    } catch {
      showMessage('Não foi possível compartilhar o extrato.');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar title="Extrato" />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 80 }} color={colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.balance}>
            <AppText variant="headline" color="textMuted">
              Saldo Disponível
            </AppText>
            <AppText style={styles.balanceValue}>{formatCurrency(summary.balance)}</AppText>
          </View>

          <SegmentedControl<Filter>
            value={filter}
            onChange={(v) => {
              setFilter(v);
              setCategoryId(null);
            }}
            options={[
              { value: 'all', label: 'Tudo' },
              { value: 'income', label: 'Entradas' },
              { value: 'expense', label: 'Saídas' },
            ]}
          />

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={handleDownload}
              style={({ pressed }) => [styles.action, styles.actionPrimary, pressed && { opacity: 0.85 }]}
            >
              <MaterialIcons name="file-download" size={18} color={colors.white} />
              <AppText variant="headline" style={{ color: colors.white }}>
                Baixar
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: showFilters }}
              onPress={() => setShowFilters((s) => !s)}
              style={({ pressed }) => [styles.action, styles.actionSecondary, pressed && { opacity: 0.85 }]}
            >
              <MaterialIcons name="filter-list" size={18} color="#6D625B" />
              <AppText variant="headline" style={{ color: '#6D625B' }}>
                Filtros{categoryId ? ' (1)' : ''}
              </AppText>
            </Pressable>
          </View>

          {showFilters && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {categories
                .filter((c) => filter === 'all' || c.type === filter)
                .map((c) => {
                  const active = c.id === categoryId;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setCategoryId(active ? null : c.id)}
                      style={[styles.chip, active && styles.chipActive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <AppText variant="footnote" style={{ color: active ? colors.white : colors.textMuted }}>
                        {c.label}
                      </AppText>
                    </Pressable>
                  );
                })}
            </ScrollView>
          )}

          {groups.length === 0 && (
            <AppText color="textMuted" align="center" style={{ marginTop: spacing.xl }}>
              Nenhuma transação encontrada.
            </AppText>
          )}

          {groups.map((group) => (
            <View key={group[0]!.date.toDateString()} style={{ gap: spacing.sm }}>
              <AppText variant="headline" color="textMuted" style={{ paddingLeft: spacing.lg }}>
                {dayLabel(group[0]!.date)}
              </AppText>
              <View style={[styles.list, shadows.card]}>
                {group.map((tx, i) => (
                  <View key={tx.id}>
                    {i > 0 && <ItemDivider />}
                    <TransactionItem
                      transaction={tx}
                      subtitle={`${getCategory(tx.categoryId).label} • ${tx.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                      onPress={() => router.push({ pathname: routes.newTransaction, params: { id: tx.id } })}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  balance: { alignItems: 'center', paddingTop: spacing.sm, gap: 4 },
  balanceValue: { fontFamily: 'Inter_700Bold', fontSize: 34, lineHeight: 41, letterSpacing: 0.37, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  actionPrimary: { backgroundColor: colors.primary },
  actionSecondary: { backgroundColor: '#EFE0D6' },
  chips: { gap: spacing.sm, marginTop: -spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.chip },
  chipActive: { backgroundColor: colors.primary },
  list: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
});
