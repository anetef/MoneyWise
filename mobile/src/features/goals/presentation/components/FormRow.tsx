import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
} from '../../../../core/theme';

type Props = {
    label: string;
    icon?: string;
    description?: string;
    comingSoon?: boolean;
    children?: ReactNode;
};

/**
 * Linha de formulário com rótulo à esquerda e
 * conteúdo à direita.
 *
 * Com `comingSoon`, a linha aparece desabilitada e
 * sinalizada como "Em breve" (campos pendentes de L-08).
 */
export function FormRow({
    label,
    icon,
    description,
    comingSoon = false,
    children,
}: Props) {
    return (
        <View
            style={[styles.row, comingSoon && styles.disabled]}
            accessibilityState={{ disabled: comingSoon }}
        >
            <View style={styles.labelArea}>
                <View style={styles.labelRow}>
                    {icon && <Text style={styles.icon}>{icon}</Text>}

                    <Text style={styles.label}>{label}</Text>

                    {comingSoon && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Em breve</Text>
                        </View>
                    )}
                </View>

                {description && (
                    <Text style={styles.description}>{description}</Text>
                )}
            </View>

            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.lg,
    },

    disabled: {
        opacity: 0.55,
    },

    labelArea: {
        flex: 1,
        gap: spacing.xxs,
    },

    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    icon: {
        width: 20,
        textAlign: 'center',
        fontSize: fontSize.md,
        color: colors.primary,
    },

    label: {
        flexShrink: 1,
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    description: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    badge: {
        backgroundColor: colors.surface.secondary,
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs,
    },

    badgeText: {
        fontFamily: fontFamily.medium,
        fontSize: 10,
        color: colors.text.secondary,
    },
});
