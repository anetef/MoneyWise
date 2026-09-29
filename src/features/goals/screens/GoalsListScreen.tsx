import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, SegmentedControl, TopBar } from '@/core/components';
import { routes } from '@/core/navigation/routes';
import { colors, radius, shadows, spacing } from '@/core/theme';
import { GoalCard } from '../components/GoalCard';
import { useGoals } from '../useGoals';

type Tab = 'individual' | 'shared';

/** Figma: "Caixinhas - Lista" — RF-11, RF-17 */
export function GoalsListScreen() {
  const { individual, shared, loading } = useGoals();
  const [tab, setTab] = useState<Tab>('individual');
  const list = tab === 'individual' ? individual : shared;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar variant="large" title="Caixinhas" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'individual', label: 'Individuais' },
            { value: 'shared', label: 'Compartilhadas' },
          ]}
        />

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
        ) : list.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="savings" size={36} color={colors.primaryMuted} />
            <AppText color="textMuted" align="center">
              {tab === 'individual'
                ? 'Você ainda não tem caixinhas individuais.'
                : 'Nenhuma caixinha compartilhada ainda. Crie uma e convide quem você confia!'}
            </AppText>
          </View>
        ) : (
          list.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onPress={() => router.push(routes.goalDetails(goal.id))} />
          ))
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: routes.newGoal, params: { shared: tab === 'shared' ? '1' : '0' } })}
          style={({ pressed }) => [styles.newButton, shadows.raised, pressed && { opacity: 0.9 }]}
        >
          <MaterialIcons name="add-circle-outline" size={22} color={colors.white} />
          <AppText variant="button" style={styles.newText}>
            Nova Caixinha
          </AppText>
        </Pressable>
        <AppText variant="caption" color="textMuted" align="center" style={styles.hint}>
          Guarde dinheiro de forma organizada para alcançar seus objetivos mais rápido.
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  newButton: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  newText: { color: colors.white, fontSize: 17 },
  hint: { marginTop: -spacing.md, paddingHorizontal: spacing.lg },
});
