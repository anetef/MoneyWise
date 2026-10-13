import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';
import type { PressableProps } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

type ButtonProps = {
    title: string;
    onPress: PressableProps['onPress'];
    variant?: 'primary' | 'secondary' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
    accessibilityLabel?: string;
};

export function Button({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    accessibilityLabel,
}: ButtonProps) {
    const isDisabled = disabled || loading;
    const contentColor =
        variant === 'primary' ? colors.text.inverse : colors.primary;

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? title}
            accessibilityState={{
                disabled: isDisabled,
                busy: loading,
            }}
            style={({ pressed }) => [
                styles.base,
                styles[variant],
                pressed && !isDisabled && styles.pressed,
                isDisabled && styles.disabled,
            ]}
        >
            {loading && (
                <ActivityIndicator size="small" color={contentColor} />
            )}

            <Text style={[styles.label, { color: contentColor }]}>
                {title}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        minHeight: spacing.massive + spacing.sm,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.surface.primary,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    label: {
        ...typography.button,
        flexShrink: 1,
        textAlign: 'center',
    },
    pressed: {
        opacity: 0.8,
    },
    disabled: {
        opacity: 0.5,
    },
});