import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/core/theme';

/** Barra de progresso horizontal (cards de caixinhas). `progress` de 0 a 1. */
export function ProgressBar({
  progress,
  height = 8,
  color = colors.primary,
  trackColor = colors.border,
}: {
  progress: number;
  height?: number;
  color?: string;
  trackColor?: string;
}) {
  const pct = Math.min(Math.max(progress, 0), 1) * 100;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={[styles.track, { height, backgroundColor: trackColor }]}
    >
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
