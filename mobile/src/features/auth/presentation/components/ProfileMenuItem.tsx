import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
} from '../../../../core/theme';

type Props = {
    icon: string;
    label: string;
    onPress: () => void;
};

/**
 * Item do menu da tela Meu Perfil.
 */
export function ProfileMenuItem({ icon, label, onPress }: Props) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
            <View style={styles.iconCircle}>
                <Text style={styles.icon}>{icon}</Text>
            </View>

            <Text style={styles.label}>{label}</Text>

            <Text style={styles.chevron}>›</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        paddingVertical: spacing.lg,
    },

    pressed: {
        opacity: 0.7,
    },

    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: radius.full,
        backgroundColor: 'rgba(130, 59, 24, 0.14)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    icon: {
        fontSize: fontSize.md,
        color: colors.primary,
    },

    label: {
        flex: 1,
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },

    chevron: {
        fontSize: fontSize.xl,
        color: colors.text.secondary,
    },
});
