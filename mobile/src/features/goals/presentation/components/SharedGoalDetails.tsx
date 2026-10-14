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

import { ContributorItem } from './ContributorItem';
import { goalColors } from './goalColors';
import { getGoalVisual } from './goalVisuals';
import { GoalRecordItem } from './GoalRecordItem';
import { Thermometer } from './Thermometer';

type Props = {
    goal: GoalDetails;
    onRegisterContribution: () => void;
    onShare: () => void;
    onInvite: () => void;
    onOpenSettings: () => void;
    onSeeAllRecords: () => void;
};

/**
 * Conteúdo dos detalhes de uma Caixinha compartilhada
 * (frame "Caixinha - Detalhes (Compartilhada)").
 *
 * Mostra apenas os valores da Caixinha; nenhum saldo
 * pessoal dos membros é exibido (RN08).
 */
export function SharedGoalDetails({
    goal,
    onRegisterContribution,
    onShare,
    onInvite,
    onOpenSettings,
    onSeeAllRecords,
}: Props) {
    const visual = getGoalVisual(goal.id);

    return (
        <View style={styles.container}>
            {/* Destaque com o anel de progresso */}
            <View style={styles.hero}>
                {/* Círculos decorativos do Figma */}
                <View style={[styles.decoration, styles.decorationTop]} />
                <View style={[styles.decoration, styles.decorationBottom]} />

                <View style={styles.titleRow}>
                    <View style={styles.titleContent}>
                        <Text style={styles.name}>{goal.name}</Text>
                        <Text style={styles.typeLabel}>
                            {visual.icon}  Caixinha compartilhada
                        </Text>
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

                <View style={styles.ringArea}>
                    <Thermometer progress={goal.progress} variant="ring" size={190} strokeWidth={16}>
                        <Text style={styles.ringPercent}>{goal.progress.percent}%</Text>
                        <Text style={styles.ringAmounts}>
                            {formatCurrency(goal.accumulatedAmount, { compact: true })} de{' '}
                            {formatCurrency(goal.targetAmount, { compact: true })}
                        </Text>
                    </Thermometer>
                </View>

                {/* Ações */}
                <View style={styles.actions}>
                    <Pressable
                        onPress={onRegisterContribution}
                        accessibilityRole="button"
                        style={({ pressed }) => [
                            styles.actionButton,
                            styles.primaryAction,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.primaryActionText}>+ Registrar aporte</Text>
                    </Pressable>

                    <Pressable
                        onPress={onShare}
                        accessibilityRole="button"
                        style={({ pressed }) => [
                            styles.actionButton,
                            styles.secondaryAction,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.secondaryActionText}>⇪  Compartilhar</Text>
                    </Pressable>
                </View>
            </View>

            {/* Contribuições por membro (RF-14) */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Contribuições</Text>

                    <Pressable onPress={onInvite} accessibilityRole="button" hitSlop={spacing.sm}>
                        <Text style={styles.sectionLink}>Convidar</Text>
                    </Pressable>
                </View>

                <View style={styles.card}>
                    {goal.members.map((member, index) => (
                        <View key={member.id}>
                            {index > 0 && <View style={styles.divider} />}
                            <ContributorItem member={member} />
                        </View>
                    ))}
                </View>
            </View>

            {/* Registros */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Registros</Text>

                    <Pressable onPress={onSeeAllRecords} accessibilityRole="button" hitSlop={spacing.sm}>
                        <Text style={styles.sectionLink}>Ver todos</Text>
                    </Pressable>
                </View>

                <View style={styles.card}>
                    {goal.records.length === 0 ? (
                        <Text style={styles.emptyText}>
                            Nenhum registro ainda. Os aportes dos membros
                            aparecerão aqui.
                        </Text>
                    ) : (
                        goal.records.map((record, index) => (
                            <View key={record.id}>
                                {index > 0 && <View style={styles.divider} />}
                                <GoalRecordItem record={record} variant="contribution" />
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
        gap: spacing.xxl,
    },

    pressed: {
        opacity: 0.85,
    },

    hero: {
        gap: spacing.xl,
    },

    decoration: {
        position: 'absolute',
        borderRadius: radius.full,
        backgroundColor: 'rgba(21, 36, 55, 0.04)',
    },

    decorationTop: {
        width: 180,
        height: 180,
        top: -70,
        right: -90,
    },

    decorationBottom: {
        width: 120,
        height: 120,
        bottom: 30,
        left: -80,
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },

    titleContent: {
        flex: 1,
        gap: spacing.xs,
    },

    name: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xxl,
        lineHeight: 30,
        color: colors.text.primary,
    },

    typeLabel: {
        ...typography.caption,
        color: colors.text.secondary,
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

    ringArea: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },

    ringPercent: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xxxl,
        lineHeight: 34,
        color: colors.text.primary,
    },

    ringAmounts: {
        fontFamily: fontFamily.regular,
        fontSize: 11,
        color: colors.text.secondary,
        textAlign: 'center',
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

    section: {
        gap: spacing.sm,
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xs,
    },

    sectionTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },

    sectionLink: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.primary,
    },

    card: {
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

    emptyText: {
        ...typography.caption,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingVertical: spacing.xl,
    },
});
