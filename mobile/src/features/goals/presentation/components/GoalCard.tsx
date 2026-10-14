import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    shadows,
    spacing,
    typography,
} from '../../../../core/theme';

import type { Goal } from '../../domain/Goal';
import { formatCurrency } from '../utils/formatCurrency';

import { getGoalVisual } from './goalVisuals';
import { Thermometer } from './Thermometer';

type Props = {
    goal: Goal;
    onPress: () => void;
};

/**
 * Cartão de Caixinha exibido na lista.
 */
export function GoalCard({ goal, onPress }: Props) {
    const visual = getGoalVisual(goal.id);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir detalhes da caixinha ${goal.name}`}
            onPress={onPress}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
            {/* Capa temporária */}
            <View style={[styles.cover, { backgroundColor: visual.coverColor }]}>
                <Text style={styles.coverEmoji}>{visual.cover}</Text>
            </View>

            <View style={styles.body}>
                <View style={styles.titleRow}>
                    <View style={styles.titleContent}>
                        <Text style={styles.name} numberOfLines={1}>
                            {goal.name}
                        </Text>

                        {goal.deadlineLabel && (
                            <Text style={styles.deadline}>
                                {goal.deadlineLabel}
                            </Text>
                        )}
                    </View>

                    <View style={styles.iconCircle}>
                        <Text style={styles.icon}>{visual.icon}</Text>
                    </View>
                </View>

                <View style={styles.amountRow}>
                    <Text style={styles.accumulated}>
                        {formatCurrency(goal.accumulatedAmount)}
                    </Text>

                    <Text style={styles.target}>
                        de {formatCurrency(goal.targetAmount)}
                    </Text>
                </View>

                <Thermometer progress={goal.progress} />

                <Text style={styles.percent}>
                    {goal.progress.percent}% concluído
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface.primary,
        borderRadius: radius.lg,
        overflow: 'hidden',
        ...shadows.sm,
    },

    pressed: {
        opacity: 0.9,
    },

    cover: {
        height: 112,
        alignItems: 'center',
        justifyContent: 'center',
    },

    coverEmoji: {
        fontSize: 48,
    },

    body: {
        padding: spacing.lg,
        gap: spacing.sm,
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },

    titleContent: {
        flex: 1,
        gap: spacing.xxs,
    },

    name: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.text.primary,
    },

    deadline: {
        ...typography.caption,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: radius.full,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border.default,
        alignItems: 'center',
        justifyContent: 'center',
    },

    icon: {
        fontSize: fontSize.md,
        color: colors.text.primary,
    },

    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
    },

    accumulated: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    target: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    percent: {
        alignSelf: 'flex-end',
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.primary,
    },
});
