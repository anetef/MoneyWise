import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/core/theme';

/** Indicador de etapas do onboarding: o ponto ativo é uma pílula alongada. */
export function StepDots({
  total,
  active,
  inactiveColor = colors.dot,
  size = 8,
}: {
  total: number;
  active: number;
  inactiveColor?: string;
  size?: number;
}) {
  return (
    <View style={styles.row} accessibilityLabel={`Etapa ${active + 1} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            height: size,
            width: i === active ? size * 3 : size,
            borderRadius: radius.pill,
            backgroundColor: i === active ? colors.primary : inactiveColor,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' },
});
