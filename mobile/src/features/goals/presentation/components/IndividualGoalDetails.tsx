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

import type { GoalDetails } from '../../domain/Goal';
import { formatCurrency } from '../utils/formatCurrency';

import { goalColors } from './goalColors';
import { getGoalVisual } from './goalVisuals';
import { GoalRecordItem } from './GoalRecordItem';
import { PaceCard } from './PaceCard';
import { Thermometer } from './Thermometer';

type Props = {
    goal: GoalDetails;
    onRegisterDeposit: () => void;
    onRegisterWithdrawal: () => void;
    onOpenSettings: () => void;
    onSeeAllRecords: () => void;
};

/**
 * Conteúdo dos detalhes de uma Caixinha individual
 * (frame "Caixinha - Detalhes Individual").
 */
export function IndividualGoalDetails({
    goal,
    onRegisterDeposit,
    onRegisterWithdrawal,
    onOpenSettings,
    onSeeAllRecords,
}: Props) {
    const visual = getGoalVisual(goal.id);

    return (
        <View style={styles.container}>
            {/* Identificação */}
            <View style={styles.titleRow}>
                <View style={styles.goalIcon}>
                    <Text style={styles.goalIconText}>{visual.icon}</Text>
                </View>

                <View style={styles.titleContent}>
                    <Text style={styles.name}>{goal.name}</Text>

                    <View style={styles.personalBadge}>
                        <Text style={styles.personalBadgeText}>Meta Pessoal</Text>
                    </View>
                </View>

                <Pressable
                    onPress={onOpenSettings}
                    accessibilityRole="button"
                    accessibilityLabel="Configurações da caixinha"
                    style={({ pressed }) => [
                        styles.settingsButton,
                        pressed && styles.pressed,
                    ]}
                >
                    <Text style={styles.settingsIcon}>⚙</Text>
                </Pressable>
            </View>

            {/* Saldo acumulado */}
            <View style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                    <Text style={styles.overline}>Saldo acumulado</Text>

                    <View style={styles.percentPill}>
                        <View style={styles.percentDot} />
                        <Text style={styles.percentPillText}>
                            {goal.progress.percent}% da meta
                        </Text>
                    </View>
                </View>

                <Text style={styles.balanceValue}>
                    {formatCurrency(goal.accumulatedAmount)}
                </Text>

                <Thermometer progress={goal.progress} height={10} />

                <View style={styles.balanceFooter}>
                    <Text style={styles.remaining}>
                        Faltam {formatCurrency(goal.remainingAmount)}
                    </Text>
                    <Text style={styles.target}>
                        Meta: {formatCurrency(goal.targetAmount)}
                    </Text>
                </View>
            </View>

            {/* Ações */}
            <View style={styles.actions}>
                <Pressable
                    onPress={onRegisterDeposit}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                        styles.actionButton,
                        styles.primaryAction,
                        pressed && styles.pressed,
                    ]}
                >
                    <Text style={styles.primaryActionText}>+ Registrar Entrada</Text>
                </Pressable>

                <Pressable
                    onPress={onRegisterWithdrawal}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                        styles.actionButton,
                        styles.secondaryAction,
                        pressed && styles.pressed,
                    ]}
                >
                    <Text style={styles.secondaryActionText}>— Registrar Retirada</Text>
                </Pressable>
            </View>

            {/* Ritmo (status do backend) */}
            {goal.pace && <PaceCard pace={goal.pace} />}

            {/* Histórico */}
            <View style={styles.historySection}>
                <View style={styles.historyHeader}>
                    <Text style={styles.overline}>Histórico de registros</Text>

                    <Pressable
                        onPress={onSeeAllRecords}
                        accessibilityRole="button"
                        hitSlop={spacing.sm}
                    >
                        <Text style={styles.seeAll}>Ver todos</Text>
                    </Pressable>
                </View>

                <View style={styles.historyCard}>
                    {goal.records.length === 0 ? (
                        <Text style={styles.emptyHistory}>
                            Nenhum registro ainda. As entradas e retiradas
                            aparecerão aqui.
                        </Text>
                    ) : (
                        goal.records.map((record, index) => (
                            <View key={record.id}>
                                {index > 0 && <View style={styles.divider} />}
                                <GoalRecordItem record={record} />
                            </View>
                        ))
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.xl,
    },

    pressed: {
        opacity: 0.85,
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },

    goalIcon: {
        width: 48,
        height: 48,
        borderRadius: radius.md,
        backgroundColor: goalColors.primaryTint,
        alignItems: 'center',
        justifyContent: 'center',
    },

    goalIconText: {
        fontSize: fontSize.xl,
        color: colors.primary,
    },

    titleContent: {
        flex: 1,
        alignItems: 'flex-start',
        gap: spacing.xs,
    },

    name: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        lineHeight: 26,
        color: colors.text.primary,
    },

    personalBadge: {
        backgroundColor: '#FFDCD0',
        borderRadius: radius.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs,
    },

    personalBadgeText: {
        fontFamily: fontFamily.medium,
        fontSize: 11,
        color: colors.primary,
    },

    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    settingsIcon: {
        fontSize: fontSize.lg,
        color: colors.text.inverse,
    },

    balanceCard: {
        backgroundColor: colors.surface.primary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.md,
        ...shadows.sm,
    },

    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    overline: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        color: colors.text.secondary,
    },

    percentPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: goalColors.primarySoft,
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs,
    },

    percentDot: {
        width: 6,
        height: 6,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
    },

    percentPillText: {
        fontFamily: fontFamily.medium,
        fontSize: 11,
        color: colors.primary,
    },

    balanceValue: {
        ...typography.heading,
        color: colors.text.primary,
    },

    balanceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    remaining: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    target: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        color: colors.primary,
    },

    actions: {
        flexDirection: 'row',
        gap: spacing.md,
    },

    actionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.md,
        paddingVertical: spacing.md,
    },

    primaryAction: {
        backgroundColor: colors.primary,
    },

    primaryActionText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.inverse,
    },

    secondaryAction: {
        backgroundColor: goalColors.primaryTint,
    },

    secondaryActionText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.primary,
    },

    historySection: {
        gap: spacing.sm,
    },

    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xs,
    },

    seeAll: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.primary,
    },

    historyCard: {
        backgroundColor: colors.surface.primary,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
        ...shadows.sm,
    },

    divider: {
        height: 1,
        backgroundColor: colors.border.subtle,
    },

    emptyHistory: {
        ...typography.caption,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingVertical: spacing.xl,
    },
});
