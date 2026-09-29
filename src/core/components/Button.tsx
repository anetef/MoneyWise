import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '@/core/theme';
import { AppText } from './AppText';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type Props = {
  title: string;
  onPress?: () => void;
  /** primary = terracota; secondary = azul-claro; surface = branco; ghost = só texto */
  variant?: 'primary' | 'secondary' | 'surface' | 'ghost' | 'danger';
  /** Ícone à direita do texto (ex.: seta "Continuar →"). */
  trailingIcon?: IconName;
  /** Ícone à esquerda do texto. */
  leadingIcon?: IconName;
  leading?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  radiusSize?: 'sm' | 'md';
  testID?: string;
};

const variantStyles = {
  primary: { bg: colors.primary, fg: colors.white },
  secondary: { bg: colors.surfaceTint, fg: colors.textStrong },
  surface: { bg: colors.surface, fg: colors.textStrong },
  ghost: { bg: 'transparent', fg: colors.textSecondary },
  danger: { bg: colors.surface, fg: colors.danger },
} as const;

/** Botão padrão (48px de altura, cantos de 12px), como no Figma. */
export function Button({
  title,
  onPress,
  variant = 'primary',
  trailingIcon,
  leadingIcon,
  leading,
  loading,
  disabled,
  style,
  radiusSize = 'md',
  testID,
}: Props) {
  const v = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: v.bg, borderRadius: radius[radiusSize] },
        variant !== 'ghost' && shadows.card,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.row}>
          {leading}
          {leadingIcon && <MaterialIcons name={leadingIcon} size={18} color={v.fg} />}
          <AppText variant={variant === 'ghost' ? 'footnote' : 'button'} style={{ color: v.fg }}>
            {title}
          </AppText>
          {trailingIcon && <MaterialIcons name={trailingIcon} size={16} color={v.fg} />}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
