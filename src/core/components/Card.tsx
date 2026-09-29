import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius, shadows } from '@/core/theme';

type Props = ViewProps & {
  padding?: number;
  tone?: 'surface' | 'tint';
  rounded?: keyof typeof radius;
};

/** Cartão branco com cantos arredondados e sombra leve (padrão dos cards do Figma). */
export function Card({ padding = 16, tone = 'surface', rounded = 'md', style, ...rest }: Props) {
  return (
    <View
      style={[
        styles.card,
        {
          padding,
          borderRadius: radius[rounded],
          backgroundColor: tone === 'surface' ? colors.surface : colors.surfaceTint,
        },
        shadows.card,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
});
