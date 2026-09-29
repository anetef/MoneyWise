import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/core/theme';
import { AppText } from './AppText';

/** Linha horizontal com texto no meio ("OU CONTINUE COM"). */
export function TextDivider({ label }: { label: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <AppText variant="overline" color="textSecondary" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.sm },
  line: { flex: 1, height: 1, backgroundColor: colors.borderTint },
  label: { letterSpacing: 0.3 },
});
