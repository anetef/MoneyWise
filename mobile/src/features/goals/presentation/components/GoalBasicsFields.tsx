import { StyleSheet, Text, TextInput, View } from 'react-native';

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
};

/** Largura aproximada do campo de nome, entre 120 e 260 px. */
function nameInputWidth(name: string): number {
    return Math.min(Math.max(name.length * 11 + 16, 120), 260);
}

/**
 * Campos comuns às Configurações individual e compartilhada:
 * identidade visual, nome e "Identificação & Objetivo".
 *
 * Nome, valor objetivo e data limite são editáveis; os
 * demais campos dependem de L-08 e ficam "Em breve".
 */
export function GoalBasicsFields({
    goal,
    name,
    amountText,
    deadlineText,
    errors,
    onChangeName,
    onChangeAmount,
    onChangeDeadline,
}: Props) {
    const visual = getGoalVisual(goal.id);
    const formErrors = [errors.targetAmount, errors.deadline].filter(Boolean);

    return (
        <>
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
        </>
    );
}

const styles = StyleSheet.create({
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
});
