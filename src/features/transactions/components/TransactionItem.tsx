import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/core/components';
import { colors, spacing } from '@/core/theme';
import { formatSignedCurrency } from '@/core/utils/format';
import { getCategory } from '../categories';
import type { Transaction } from '../types';

type Props = {
  transaction: Transaction;
  /** Texto abaixo do título (ex.: "Hoje, 14:30" ou "Categoria • 14:30"). */
  subtitle: string;
  onPress?: () => void;
};

/** Linha de transação usada no Dashboard e no Extrato. */
export function TransactionItem({ transaction, subtitle, onPress }: Props) {
  const category = getCategory(transaction.categoryId);
  const income = transaction.type === 'income';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.icon, { backgroundColor: income ? colors.primarySoft : colors.chip }]}>
        <MaterialCommunityIcons
          name={income ? 'arrow-down' : category.icon}
          size={20}
          color={income ? colors.primary : colors.text}
        />
      </View>
      <View style={styles.texts}>
        <AppText variant="headline" numberOfLines={1}>
          {transaction.description || category.label}
        </AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={1}>
          {subtitle}
        </AppText>
      </View>
      <AppText variant="headline" color={income ? 'primary' : 'text'}>
        {formatSignedCurrency(transaction.amount, transaction.type)}
      </AppText>
    </Pressable>
  );
}

/** Linha fina entre itens, recuada para alinhar com o texto (como no Figma). */
export function ItemDivider({ inset = 64 }: { inset?: number }) {
  return <View style={[styles.divider, { marginLeft: inset }]} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  pressed: { backgroundColor: colors.background },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1 },
  divider: { height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.border },
});
