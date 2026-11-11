import { useState } from 'react';
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

import type { GoalDetails, GoalExtras } from '../../domain/Goal';

import { FormRow } from './FormRow';
import { FormSection } from './FormSection';
import { GoalCategoryChips } from './GoalCategoryChips';
import { GoalIconGrid } from './GoalIconGrid';
import { GoalSwitch } from './GoalSwitch';
import { getGoalVisual } from './goalVisuals';

/** Campos extras da meta (L-08) e o "Meta sem prazo fixo". */
export type GoalExtrasForm = {
    extras: GoalExtras;
    noDeadline: boolean;
    onChangeExtras: (patch: Partial<GoalExtras>) => void;
    onChangeNoDeadline: (value: boolean) => void;
};

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
    extrasForm: GoalExtrasForm;
    /** Membro comum: vê os campos, mas só o Admin edita (RN04, L-17). */
    readOnly?: boolean;
};

/** Largura aproximada do campo de nome, entre 120 e 260 px. */
function nameInputWidth(name: string): number {
    return Math.min(Math.max(name.length * 11 + 16, 120), 260);
}

/**
 * Campos comuns às Configurações individual e compartilhada:
 * ícone, nome e "Identificação & Objetivo".
 *
 * Nome, valor, data, ícone, "sem prazo" e categoria (L-08) são
 * editáveis pelo Admin; para o membro comum aparecem só para
 * leitura.
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
    extrasForm,
    readOnly = false,
}: Props) {
    const { extras, noDeadline, onChangeExtras, onChangeNoDeadline } = extrasForm;
    const visual = getGoalVisual(goal.id, extras.icon);
    const formErrors = [errors.targetAmount, errors.deadline].filter(Boolean);
    const [isIconOpen, setIsIconOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    return (
        <>
            {/* Identidade visual e nome */}
            <View style={styles.identity}>
                <Pressable
                    onPress={() => setIsIconOpen((open) => !open)}
                    disabled={readOnly}
                    accessibilityRole="button"
                    accessibilityLabel="Alterar ícone"
                    accessibilityState={{ disabled: readOnly, expanded: isIconOpen }}
                    style={styles.avatar}
                >
                    <Text style={styles.avatarIcon}>{visual.icon}</Text>

                    {!readOnly && (
                        <View style={styles.cameraBadge}>
                            <Text style={styles.cameraIcon}>📷</Text>
                        </View>
                    )}
                </Pressable>

                {isIconOpen && !readOnly && (
                    <GoalIconGrid
                        value={extras.icon}
                        onChange={(icon) => {
                            onChangeExtras({ icon });
                            setIsIconOpen(false);
                        }}
                    />
                )}

                <View style={styles.nameRow}>
                    <TextInput
                        // Largura acompanha o nome para o ✎ ficar ao lado do texto.
                        style={[styles.nameInput, { width: nameInputWidth(name) }]}
                        value={name}
                        onChangeText={onChangeName}
                        placeholder="Nome da caixinha"
                        placeholderTextColor={colors.text.secondary}
                        maxLength={60}
                        editable={!readOnly}
                        accessibilityLabel="Nome da caixinha"
                    />
                    {!readOnly && <Text style={styles.editIcon}>✎</Text>}
                </View>

                {readOnly && (
                    <Text style={styles.readOnlyNote}>
                        Só o Admin pode editar esta Caixinha.
                    </Text>
                )}

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
                            editable={!readOnly}
                            accessibilityLabel="Valor objetivo"
                        />
                    </FormRow>

                    <FormRow icon="▦" label="Data Limite Estimada">
                        <TextInput
                            style={styles.dateInput}
                            value={deadlineText}
                            onChangeText={onChangeDeadline}
                            placeholder={noDeadline ? 'Sem prazo' : readOnly ? 'Sem data' : 'DD/MM/AAAA'}
                            placeholderTextColor={colors.text.secondary}
                            keyboardType="number-pad"
                            maxLength={10}
                            editable={!readOnly && !noDeadline}
                            accessibilityLabel="Data limite estimada, opcional"
                        />
                    </FormRow>

                    <FormRow
                        label="Meta sem prazo fixo"
                        description="Guardar livremente no seu próprio ritmo"
                    >
                        <GoalSwitch
                            value={noDeadline}
                            onValueChange={onChangeNoDeadline}
                            label="Meta sem prazo fixo"
                            disabled={readOnly}
                        />
                    </FormRow>

                    <FormRow icon="◇" label="Categoria">
                        <Pressable
                            onPress={() => setIsCategoryOpen((open) => !open)}
                            disabled={readOnly}
                            accessibilityRole="button"
                            accessibilityLabel={`Categoria: ${extras.category ?? 'nenhuma'}`}
                            accessibilityState={{ disabled: readOnly, expanded: isCategoryOpen }}
                            hitSlop={spacing.sm}
                        >
                            <Text style={[styles.rowValue, extras.category && styles.rowValueChosen]}>
                                {extras.category ?? (readOnly ? 'Nenhuma' : 'Selecionar')}
                                {readOnly ? '' : ' ›'}
                            </Text>
                        </Pressable>
                    </FormRow>

                    {isCategoryOpen && !readOnly && (
                        <GoalCategoryChips
                            value={extras.category}
                            onChange={(category) => {
                                onChangeExtras({ category });
                                setIsCategoryOpen(false);
                            }}
                        />
                    )}
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

    rowValueChosen: {
        color: colors.primary,
    },

    errorText: {
        ...typography.caption,
        fontSize: fontSize.xs,
        color: colors.status.error,
        textAlign: 'center',
    },

    readOnlyNote: {
        ...typography.caption,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        textAlign: 'center',
    },
});
