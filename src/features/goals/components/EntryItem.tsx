import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/core/components';
import { colors, spacing } from '@/core/theme';
import { formatCurrency, formatRelativeDate } from '@/core/utils/format';
import type { GoalEntry } from '../types';

const icons = {
  deposit: 'north-east',
  withdraw: 'south-west',
  yield: 'trending-up',
} as const;

const titles = { deposit: 'Aporte', withdraw: 'Retirada', yield: 'Rendimento' } as const;

/** Linha do histórico da caixinha (aporte, retirada ou rendimento). */
export function EntryItem({ entry, showAuthor }: { entry: GoalEntry; showAuthor: boolean }) {
  const negative = entry.type === 'withdraw';
  const subtitle = showAuthor
    ? `${entry.userName.split(' ')[0]} • ${formatRelativeDate(entry.date)}`
    : formatRelativeDate(entry.date);

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: negative ? colors.chip : colors.primarySoft }]}>
        <MaterialIcons name={icons[entry.type]} size={18} color={negative ? colors.text : colors.primary} />
      </View>
      <View style={styles.texts}>
        <AppText variant="bodyLarge" numberOfLines={1}>
          {entry.description || titles[entry.type]}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {subtitle}
        </AppText>
      </View>
      <AppText variant="headline" style={{ color: negative ? colors.danger : colors.primary, fontSize: 16 }}>
        {negative ? '-' : '+'} {formatCurrency(entry.amount)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1 },
});
