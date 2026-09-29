import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppText, ProgressBar } from '@/core/components';
import { colors, radius, shadows, spacing } from '@/core/theme';
import { formatCurrency } from '@/core/utils/format';
import { formatDeadline, goalCover } from '../goalOptions';
import type { Goal } from '../types';

/** Card de caixinha da lista (Figma: "Goal Card"). */
export function GoalCard({ goal, onPress }: { goal: Goal; onPress: () => void }) {
  const progress = goal.targetAmount > 0 ? goal.savedAmount / goal.targetAmount : 0;
  const subtitle = goal.shared
    ? `${goal.members.length} membros • ${formatDeadline(goal.deadline)}`
    : goal.deadline
      ? formatDeadline(goal.deadline)
      : goal.categoryLabel;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${goal.name}, ${Math.round(progress * 100)}% concluído`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, shadows.card, pressed && { opacity: 0.92 }]}
    >
      <Image source={goalCover(goal)} style={styles.cover} resizeMode="cover" />
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.flex}>
            <AppText style={styles.title} numberOfLines={1}>
              {goal.name}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {subtitle}
            </AppText>
          </View>
          <View style={styles.icon}>
            <MaterialCommunityIcons name={goal.icon} size={20} color={colors.text} />
          </View>
        </View>
        <View style={styles.amounts}>
          <AppText variant="caption" style={styles.saved}>
            {formatCurrency(goal.savedAmount)}
          </AppText>
          <AppText variant="caption" color="textMuted">
            de {formatCurrency(goal.targetAmount)}
          </AppText>
        </View>
        <ProgressBar progress={progress} />
        <AppText variant="caption" color="primary" align="right" style={{ marginTop: spacing.sm }}>
          {Math.round(progress * 100)}% concluído
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
  cover: { width: '100%', height: 112 },
  body: { paddingHorizontal: 20, paddingTop: spacing.sm, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, lineHeight: 28, color: colors.text },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amounts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  saved: { fontFamily: 'Inter_600SemiBold', color: colors.text },
});
