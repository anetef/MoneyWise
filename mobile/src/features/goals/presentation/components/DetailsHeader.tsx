import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    shadows,
    spacing,
} from '../../../../core/theme';

type Props = {
    title: string;
    onBack: () => void;
};

/**
 * Cabeçalho com botão de voltar e título.
 */
export function DetailsHeader({ title, onBack }: Props) {
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
});
