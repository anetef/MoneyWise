import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/core/components';
import { colors, radius, spacing } from '@/core/theme';
import { formatCurrency } from '@/core/utils/format';
import type { Thermometer, ThermometerLevel } from '../thermometer';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Aparência de cada "temperatura" da meta (RF-17). */
export const levelStyles: Record<ThermometerLevel, { bg: string; fg: string; icon: IconName }> = {
  frozen: { bg: '#E5EEFF', fg: '#3D5A80', icon: 'snowflake' },
  cold: { bg: '#EDEDF2', fg: '#54433C', icon: 'thermometer-low' },
  warm: { bg: '#F2E3D9', fg: '#823B18', icon: 'thermometer' },
  hot: { bg: '#FFDBCD', fg: '#823B18', icon: 'fire' },
  done: { bg: '#D8F0E4', fg: '#006948', icon: 'trophy-outline' },
};

function message(t: Thermometer): string {
  if (t.level === 'done') return 'Parabéns! Vocês alcançaram o objetivo.';
  if (t.monthsAhead === null) return `Faltam ${formatCurrency(t.remaining)} para a meta. Siga no seu ritmo!`;
  const monthly = t.monthlyNeeded ? ` Guardando ${formatCurrency(t.monthlyNeeded)} por mês, a meta é cumprida no prazo.` : '';
  if (t.monthsAhead > 0) {
    return `Você está acima do ritmo planejado! Mantendo esse valor, a meta será alcançada ${t.monthsAhead} ${t.monthsAhead === 1 ? 'mês' : 'meses'} antes do previsto.`;
  }
  if (t.monthsAhead < 0) {
    return `A meta está ${Math.abs(t.monthsAhead)} ${t.monthsAhead === -1 ? 'mês' : 'meses'} atrasada.${monthly}`;
  }
  return `Você está no ritmo planejado!${monthly}`;
}

/** Cartão do Termômetro com o status calculado pela regra RN-01. */
export function ThermometerCard({ thermometer }: { thermometer: Thermometer }) {
  const s = levelStyles[thermometer.level];
  return (
    <View style={[styles.card, { backgroundColor: s.bg }]} accessibilityRole="summary">
      <View style={[styles.icon, { backgroundColor: s.fg }]}>
        <MaterialCommunityIcons name={s.icon} size={18} color={colors.white} />
      </View>
      <View style={styles.texts}>
        <AppText variant="headline" style={{ color: colors.text, fontSize: 16 }}>
          {thermometer.label}
        </AppText>
        <AppText variant="callout" color="textMuted">
          {message(thermometer)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: radius.md },
  icon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 4 },
});
