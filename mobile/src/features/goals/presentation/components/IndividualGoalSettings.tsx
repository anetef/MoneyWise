import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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

import { DisabledSwitch } from './DisabledSwitch';
import { FormRow } from './FormRow';
import { FormSection } from './FormSection';
import { getGoalVisual } from './goalVisuals';

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

/** Largura aproximada do campo de nome, entre 120 e 260 px. */
function nameInputWidth(name: string): number {
    return Math.min(Math.max(name.length * 11 + 16, 120), 260);
}

/**
 * Conteúdo das Configurações de uma Caixinha individual
 * (frame "Caixinha - Configurações (Individual)").
 *
 * Nome, valor objetivo e data limite são editáveis; os
 * demais campos dependem de L-08 e ficam "Em breve".
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
    const visual = getGoalVisual(goal.id);
    const formErrors = [errors.targetAmount, errors.deadline].filter(Boolean);

    return (
        <View style={styles.container}>
            {/* Identidade visual e nome */}
            <View style={styles.identity}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarIcon}>{visual.icon}</Text>

                    {/* Troca de ícone ou foto depende de L-08 */}
                    <View
                        style={styles.cameraBadge}
                        accessibilityLabel="Alterar ícone, em breve"
                    >
                        <Text style={styles.cameraIcon}>📷</Text>
                    </View>
                </View>

                <View style={styles.nameRow}>
                    <TextInput
                        // Largura acompanha o nome para o ✎ ficar ao lado do texto.
                        style={[styles.nameInput, { width: nameInputWidth(name) }]}
                        value={name}
                        onChangeText={onChangeName}
                        placeholder="Nome da caixinha"
                        placeholderTextColor={colors.text.secondary}
                        maxLength={60}
                        accessibilityLabel="Nome da caixinha"
                    />
                    <Text style={styles.editIcon}>✎</Text>
                </View>

                {errors.name && (
                    <Text style={styles.errorText} accessibilityRole="alert">
                        {errors.name}
                    </Text>
                )}
            </View>

            {/* Identificação e objetivo */}
            <View style={styles.sectionGroup}>
                <FormSection title="Identificação & Objetivo" aside="Planejamento">
                    <FormRow icon="⚑" label="Valor Objetivo">
                        <TextInput
                            style={styles.amountInput}
                            value={amountText}
                            onChangeText={onChangeAmount}
                            placeholder="R$ 0,00"
                            placeholderTextColor={colors.text.secondary}
                            keyboardType="number-pad"
                            accessibilityLabel="Valor objetivo"
                        />
                    </FormRow>

                    <FormRow icon="▦" label="Data Limite Estimada">
                        <TextInput
                            style={styles.dateInput}
                            value={deadlineText}
                            onChangeText={onChangeDeadline}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor={colors.text.secondary}
                            keyboardType="number-pad"
                            maxLength={10}
                            accessibilityLabel="Data limite estimada, opcional"
                        />
                    </FormRow>

                    <FormRow
                        label="Meta sem prazo fixo"
                        description="Guardar livremente no seu próprio ritmo"
                        comingSoon
                    >
                        <DisabledSwitch />
                    </FormRow>

                    <FormRow icon="◇" label="Categoria" comingSoon>
                        <Text style={styles.rowValue}>Selecionar ›</Text>
                    </FormRow>
                </FormSection>

                {formErrors.map((message) => (
                    <Text
                        key={message}
                        style={styles.errorText}
                        accessibilityRole="alert"
                    >
                        {message}
                    </Text>
                ))}
            </View>

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

    identity: {
        alignItems: 'center',
        gap: spacing.sm,
    },

    avatar: {
        width: 96,
        height: 96,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },

    avatarIcon: {
        fontSize: 40,
        color: colors.text.inverse,
    },

    cameraBadge: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: colors.surface.primary,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.6,
        ...shadows.sm,
    },

    cameraIcon: {
        fontSize: fontSize.sm,
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        alignSelf: 'stretch',
    },

    nameInput: {
        textAlign: 'center',
        fontFamily: fontFamily.medium,
        fontSize: fontSize.lg,
        color: colors.text.primary,
        paddingVertical: spacing.xs,
    },

    editIcon: {
        fontSize: fontSize.md,
        color: colors.text.secondary,
    },

    sectionGroup: {
        gap: spacing.sm,
    },

    amountInput: {
        width: 140,
        textAlign: 'right',
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.primary,
        paddingVertical: 0,
    },

    dateInput: {
        width: 110,
        textAlign: 'right',
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
        paddingVertical: 0,
    },

    rowValue: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },

    errorText: {
        ...typography.caption,
        fontSize: fontSize.xs,
        color: colors.status.error,
        textAlign: 'center',
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
