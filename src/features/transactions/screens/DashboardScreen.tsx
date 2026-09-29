import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Avatar, Card, Fab, ProgressRing, TopBar } from '@/core/components';
import { routes } from '@/core/navigation/routes';
import { colors, radius, shadows, spacing } from '@/core/theme';
import { formatCurrency, formatRelativeDate } from '@/core/utils/format';
import { useCurrentUser } from '@/features/auth/AuthContext';
import { ItemDivider, TransactionItem } from '../components/TransactionItem';
import { getCategory } from '../categories';
import { useTransactions } from '../useTransactions';

/** Figma: "Dashboard Individual (Terracotta)" — RF-09, RF-23 */
export function DashboardScreen() {
  const user = useCurrentUser();
  const { items, summary, loading } = useTransactions();
  const recent = items.slice(0, 3);

  // "Gastos 75%" = quanto das entradas do mês já foi gasto.
  const spentRatio = summary.monthIncome > 0 ? summary.monthExpense / summary.monthIncome : 0;
  const topCategories = summary.expenseByCategory.slice(0, 3);
  const totalExpense = summary.monthExpense || 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar
        variant="large"
        title="Dashboard"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
            onPress={() => router.navigate(routes.profile)}
          >
            <Avatar name={user.name} size={32} />
          </Pressable>
        }
      />

      {loading ? (
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.balance}>
            <AppText variant="headline" color="textMuted">
              Saldo Atual
            </AppText>
            <AppText variant="display" adjustsFontSizeToFit numberOfLines={1}>
              {formatCurrency(summary.balance)}
            </AppText>
          </View>

          <View style={styles.row}>
            <Card style={styles.flex}>
              <View style={styles.inline}>
                <MaterialIcons name="arrow-downward" size={14} color={colors.textMuted} />
                <AppText variant="callout" color="textMuted">
                  Entradas
                </AppText>
              </View>
              <AppText style={styles.cardValue} color="primary">
                {formatCurrency(summary.monthIncome)}
              </AppText>
            </Card>
            <Card style={styles.flex}>
              <View style={styles.inline}>
                <MaterialIcons name="arrow-upward" size={14} color={colors.textMuted} />
                <AppText variant="callout" color="textMuted">
                  Saídas
                </AppText>
              </View>
              <AppText style={styles.cardValue}>{formatCurrency(summary.monthExpense)}</AppText>
            </Card>
          </View>

          <Card padding={20}>
            <View style={[styles.between, { paddingBottom: spacing.sm }]}>
              <AppText variant="headline">Resumo de Categorias</AppText>
              <MaterialIcons name="more-horiz" size={20} color={colors.text} />
            </View>
            {topCategories.length === 0 ? (
              <AppText variant="callout" color="textMuted">
                Nenhum gasto registrado este mês.
              </AppText>
            ) : (
              <View style={[styles.inline, { gap: spacing.lg }]}>
                <ProgressRing
                  size={96}
                  strokeWidth={10}
                  trackColor={colors.primaryMuted + '66'}
                  progress={Math.min(spentRatio, 1)}
                >
                  <AppText variant="caption" color="textMuted">
                    Gastos
                  </AppText>
                  <AppText variant="headline">{Math.round(spentRatio * 100)}%</AppText>
                </ProgressRing>
                <View style={[styles.flex, { gap: spacing.md }]}>
                  {topCategories.map((slice, i) => (
                    <View key={slice.categoryId} style={styles.between}>
                      <View style={[styles.inline, { gap: spacing.sm }]}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: [colors.primary, colors.primaryMuted, colors.border][i] },
                          ]}
                        />
                        <AppText variant="callout" color="textMuted" style={{ letterSpacing: -0.41 }}>
                          {getCategory(slice.categoryId).label}
                        </AppText>
                      </View>
                      <AppText variant="headline" accessibilityLabel={`${Math.round((slice.total / totalExpense) * 100)}% dos gastos`}>
                        {formatCurrency(slice.total)}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>

          <View style={{ gap: spacing.sm }}>
            <AppText variant="overline" color="textMuted" style={styles.sectionTitle}>
              Últimas transações
            </AppText>
            <View style={[styles.list, shadows.card]}>
              {recent.length === 0 && (
                <View style={styles.empty}>
                  <MaterialCommunityIcons name="receipt-text-outline" size={28} color={colors.textMuted} />
                  <AppText variant="callout" color="textMuted" align="center">
                    Nenhuma transação ainda. Toque em + para registrar a primeira.
                  </AppText>
                </View>
              )}
              {recent.map((tx) => (
                <View key={tx.id}>
                  <TransactionItem
                    transaction={tx}
                    subtitle={`${getCategory(tx.categoryId).label} • ${formatRelativeDate(tx.date)}`}
                    onPress={() => router.push({ pathname: routes.newTransaction, params: { id: tx.id } })}
                  />
                  <ItemDivider />
                </View>
              ))}
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push(routes.statement)}
                style={({ pressed }) => [styles.viewAll, pressed && { opacity: 0.6 }]}
              >
                <AppText variant="headline" color="primaryDark">
                  Ver extrato completo
                </AppText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}

      <Fab accessibilityLabel="Adicionar transação" onPress={() => router.push(routes.newTransaction)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { marginTop: 80 },
  content: { padding: spacing.lg, paddingBottom: 100, gap: spacing.xl },
  balance: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    alignItems: 'center',
    paddingTop: spacing.xl + spacing.lg,
    paddingBottom: spacing.xl + spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardValue: { fontSize: 18, lineHeight: 28, marginTop: 8 },
  legendDot: { width: 12, height: 12, borderRadius: radius.pill },
  sectionTitle: { paddingLeft: spacing.lg, paddingTop: spacing.sm, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  list: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
  empty: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  viewAll: { padding: spacing.md, alignItems: 'center' },
});
