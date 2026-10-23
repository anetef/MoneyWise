import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    shadows,
    spacing,
} from '../../../../core/theme';

type HeaderAction = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
};

type Props = {
    title: string;
    onBack: () => void;
    /** Ação de texto opcional à direita (ex.: "Salvar"). */
    action?: HeaderAction;
};

/**
 * Cabeçalho com botão de voltar, título e ação opcional.
 */
export function DetailsHeader({ title, onBack, action }: Props) {
    return (
        <View style={styles.header}>
            <Pressable
                onPress={onBack}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                hitSlop={spacing.md}
                style={styles.backButton}
            >
                <Text style={styles.backIcon}>‹</Text>
            </Pressable>

            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>

            {action && (
                <Pressable
                    onPress={action.onPress}
                    disabled={action.disabled}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: action.disabled }}
                    hitSlop={spacing.md}
                    style={({ pressed }) => (pressed || action.disabled) && styles.actionPressed}
                >
                    <Text style={styles.actionText}>{action.label}</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.surface.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        ...shadows.sm,
    },

    backButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },

    backIcon: {
        fontSize: 32,
        lineHeight: 34,
        color: colors.primary,
    },

    title: {
        flex: 1,
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },

    actionText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.primary,
    },

    actionPressed: {
        opacity: 0.6,
    },
});
