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
    onArchive: () => void;
    onDelete: () => void;
};

/**
 * Conteúdo das Configurações de uma Caixinha individual
 * (frame "Caixinha - Configurações (Individual)").
 *
 * Os campos comuns ficam em GoalBasicsFields.
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
    onArchive,
    onDelete,
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
                    onPress={onArchive}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
                >
                    <Text style={styles.actionIcon}>⊡</Text>
                    <Text style={styles.actionLabel}>Arquivar Caixinha</Text>
                    <Text style={styles.chevron}>›</Text>
                </Pressable>

                <View style={styles.divider} />

                <Pressable
                    onPress={onDelete}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
                >
                    <Text style={[styles.actionIcon, styles.dangerText]}>🗑</Text>
                    <Text style={[styles.actionLabel, styles.dangerText]}>
                        Excluir Meta Cadastrada
                    </Text>
                    <Text style={[styles.chevron, styles.dangerText]}>›</Text>
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

    pressed: {
        opacity: 0.7,
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

    chevron: {
        fontSize: fontSize.lg,
        color: colors.text.secondary,
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
