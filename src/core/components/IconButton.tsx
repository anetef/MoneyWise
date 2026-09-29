import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius } from '@/core/theme';

type Props = {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  onPress?: () => void;
  accessibilityLabel: string;
  /** tint = fundo azul-claro redondo (botão voltar); plain = só o ícone */
  variant?: 'tint' | 'plain' | 'primary';
  size?: number;
  color?: string;
};

/** Botão redondo só com ícone (voltar, fechar, mais opções...). */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'plain',
  size = 40,
  color,
}: Props) {
  const bg =
    variant === 'tint' ? colors.surfaceTint : variant === 'primary' ? colors.primary : 'transparent';
  const fg = color ?? (variant === 'primary' ? colors.white : colors.textStrong);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, backgroundColor: bg },
        pressed && { opacity: 0.7 },
      ]}
    >
      <MaterialIcons name={icon} size={Math.round(size * 0.55)} color={fg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
