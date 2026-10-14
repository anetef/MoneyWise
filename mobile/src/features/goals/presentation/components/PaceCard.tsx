import { StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
} from '../../../../core/theme';

import type { GoalPace } from '../../domain/Goal';

import { toneColors } from './goalColors';

type Props = {
    pace: GoalPace;
};

/**
 * Cartão de ritmo da Caixinha.
 *
 * Exibe o status recebido do backend (RN01),
 * sem cálculo no aplicativo.
 */
export function PaceCard({ pace }: Props) {
    const tone = toneColors[pace.tone];

    return (
        <View style={[styles.card, { backgroundColor: tone.background }]}>
            <View style={[styles.iconCircle, { backgroundColor: tone.accent }]}>
                <Text style={styles.icon}>↗</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: tone.accent }]}>
                    {pace.title}
                </Text>
                <Text style={styles.message}>{pace.message}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        gap: spacing.md,
        borderRadius: radius.lg,
        padding: spacing.lg,
    },

    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },

    icon: {
        fontSize: fontSize.sm,
        color: colors.text.inverse,
    },

    content: {
        flex: 1,
        gap: spacing.xs,
    },

    title: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.sm,
    },

    message: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        lineHeight: 18,
        color: colors.text.primary,
    },
});
