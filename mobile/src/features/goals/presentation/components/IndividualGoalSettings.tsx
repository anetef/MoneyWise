import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    shadows,
    spacing,
} from '../../../../core/theme';

import type { GoalDetails } from '../../domain/Goal';

import { DisabledSwitch } from './DisabledSwitch';
import { FormRow } from './FormRow';
import { FormSection } from './FormSection';
import { GoalBasicsFields } from './GoalBasicsFields';

type FormErrors = {
    name?: string;
    targetAmount?: string;
    deadline?: string;
};

type Props = {
    goal: GoalDetails;
    name: string;
    amountText: string;
    deadlineText: string;
    errors: FormErrors;
    onChangeName: (value: string) => void;
    onChangeAmount: (value: string) => void;
    onChangeDeadline: (value: string) => void;
};

/**
 * Conteúdo das Configurações de uma Caixinha individual
 * (frame "Caixinha - Configurações (Individual)").
 *
 * Os campos comuns ficam em GoalBasicsFields. Arquivar e
 * excluir aparecem desativados, com "Em breve" (L-09).
 */
export function IndividualGoalSettings({
    goal,
    name,
    amountText,
    deadlineText,
    errors,
    onChangeName,
    onChangeAmount,
    onChangeDeadline,
}: Props) {
    return (
        <View style={styles.container}>
            <GoalBasicsFields
                goal={goal}
                name={name}
                amountText={amountText}
                deadlineText={deadlineText}
                errors={errors}
                onChangeName={onChangeName}
                onChangeAmount={onChangeAmount}
                onChangeDeadline={onChangeDeadline}
            />

            <FormSection
                title="Rotina & Lembretes"
                aside="Controle Pessoal"
                asideTone="primary"
            >
                <FormRow
                    icon="🔔"
                    label="Lembrete Mensal"
                    description="Aviso no smartphone para registrar economia"
                    comingSoon
                >
                    <DisabledSwitch />
                </FormRow>
            </FormSection>

            <FormSection title="Regras de Gestão & Foco">
                <FormRow
                    icon="♕"
                    label="Marcos de Conquista"
                    description="Feedback motivador a cada 25% completado"
                    comingSoon
                >
                    <DisabledSwitch />
                </FormRow>
            </FormSection>

            {/* Arquivar e excluir dependem de L-09 */}
            <View style={styles.actionsCard}>
                <Pressable
                    disabled
                    accessibilityRole="button"
                    accessibilityLabel="Arquivar Caixinha, em breve"
                    accessibilityState={{ disabled: true }}
                    style={[styles.actionRow, styles.disabled]}
                >
                    <Text style={styles.actionIcon}>⊡</Text>
                    <Text style={styles.actionLabel}>Arquivar Caixinha</Text>
                    <View style={styles.soonBadge}>
                        <Text style={styles.soonBadgeText}>Em breve</Text>
                    </View>
                </Pressable>

                <View style={styles.divider} />

                <Pressable
                    disabled
                    accessibilityRole="button"
                    accessibilityLabel="Excluir Meta Cadastrada, em breve"
                    accessibilityState={{ disabled: true }}
                    style={[styles.actionRow, styles.disabled]}
                >
                    <Text style={[styles.actionIcon, styles.dangerText]}>🗑</Text>
                    <Text style={[styles.actionLabel, styles.dangerText]}>
                        Excluir Meta Cadastrada
                    </Text>
                    <View style={styles.soonBadge}>
                        <Text style={styles.soonBadgeText}>Em breve</Text>
                    </View>
                </Pressable>
            </View>

            {/* Aviso do Figma */}
            <View style={styles.notice}>
                <Text style={styles.noticeIcon}>ⓘ</Text>
                <Text style={styles.noticeText}>
                    Este aplicativo realiza estritamente a{' '}
                    <Text style={styles.noticeStrong}>
                        gestão visual e planejamento pessoal
                    </Text>{' '}
                    de objetivos. A exclusão ou edição altera somente seus
                    registros locais e gráficos, sem impacto em bancos ou
                    contas de terceiros.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.xxl,
    },

    // Mesmo visual das linhas "Em breve" do FormRow.
    disabled: {
        opacity: 0.55,
    },

    soonBadge: {
        backgroundColor: colors.surface.secondary,
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs,
    },

    soonBadgeText: {
        fontFamily: fontFamily.medium,
        fontSize: 10,
        color: colors.text.secondary,
    },

    actionsCard: {
        backgroundColor: colors.surface.primary,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        ...shadows.sm,
    },

    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.lg,
    },

    actionIcon: {
        width: 20,
        textAlign: 'center',
        fontSize: fontSize.md,
        color: colors.text.primary,
    },

    actionLabel: {
        flex: 1,
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    dangerText: {
        color: colors.status.error,
    },

    divider: {
        height: 1,
        backgroundColor: colors.border.subtle,
    },

    notice: {
        flexDirection: 'row',
        gap: spacing.sm,
        backgroundColor: colors.border.subtle,
        borderRadius: radius.md,
        padding: spacing.md,
    },

    noticeIcon: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },

    noticeText: {
        flex: 1,
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        lineHeight: 18,
        color: colors.text.secondary,
    },

    noticeStrong: {
        fontFamily: fontFamily.semiBold,
        color: colors.text.primary,
    },
});
