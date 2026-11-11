import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    shadows,
    spacing,
} from '../../../../core/theme';

import type { GoalDetails, GoalMember } from '../../domain/Goal';

import { DisabledSwitch } from './DisabledSwitch';
import { FormRow } from './FormRow';
import { FormSection } from './FormSection';
import { GoalBasicsFields, type GoalExtrasForm } from './GoalBasicsFields';
import { GoalSwitch } from './GoalSwitch';
import { MemberSettingsItem } from './MemberSettingsItem';
import { isCurrentUserAdmin } from '../utils/goalPermissions';

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
    onInvite: () => void;
    onLeave: () => void;
    onArchive: () => void;
    /** Só o Admin remove membros (RN04, L-10). */
    onRemoveMember: (member: GoalMember) => void;
    /** Trava as ações enquanto uma operação está em andamento. */
    disabled?: boolean;
};

/**
 * Conteúdo das Configurações de uma Caixinha compartilhada
 * (frame "Caixinha - Configurações (Compartilhada)").
 *
 * Os campos comuns ficam em GoalBasicsFields. Membros e papéis
 * vêm da API. Sair, arquivar e remover membro (só o Admin)
 * chamam a API; gerenciar permissões e regras do grupo seguem
 * com "Em breve" (L-10).
 */
export function SharedGoalSettings({
    goal,
    name,
    amountText,
    deadlineText,
    errors,
    onChangeName,
    onChangeAmount,
    onChangeDeadline,
    extrasForm,
    onInvite,
    onLeave,
    onArchive,
    onRemoveMember,
    disabled = false,
}: Props) {
    const isAdmin = isCurrentUserAdmin(goal);

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
                extrasForm={extrasForm}
                readOnly={!isAdmin}
            />

            <FormSection
                title={`Membros da Caixinha (${goal.members.length})`}
                // Só o Admin convida (L-10).
                asideAction={isAdmin ? { label: '+ Convidar', onPress: onInvite } : undefined}
            >
                {goal.members.map((member) => (
                    <MemberSettingsItem
                        key={member.id}
                        member={member}
                        // O Admin remove os outros; para si mesmo há "Sair desta Caixinha".
                        onRemove={
                            isAdmin && !member.isCurrentUser
                                ? () => onRemoveMember(member)
                                : undefined
                        }
                        disabled={disabled}
                    />
                ))}

                {/* Gerenciar convites e permissões depende de L-05 e L-10 */}
                <Pressable
                    disabled
                    accessibilityRole="button"
                    accessibilityLabel="Gerenciar convites e permissões, em breve"
                    accessibilityState={{ disabled: true }}
                    style={[styles.manageRow, styles.disabled]}
                >
                    <Text style={styles.manageIcon}>⇄</Text>
                    <Text style={styles.manageLabel}>
                        Gerenciar convites e permissões
                    </Text>
                    <View style={styles.soonBadge}>
                        <Text style={styles.soonBadgeText}>Em breve</Text>
                    </View>
                </Pressable>
            </FormSection>

            <FormSection title="Regras & Governança">
                <FormRow label="Notificar novos registros no grupo" comingSoon>
                    <DisabledSwitch />
                </FormRow>
            </FormSection>

            <FormSection title="Rotina & Lembretes">
                <FormRow
                    icon="🔔"
                    label="Lembrete Mensal"
                    description="Aviso no smartphone para registrar economia"
                >
                    <GoalSwitch
                        value={extrasForm.extras.monthlyReminder}
                        onValueChange={(monthlyReminder) => extrasForm.onChangeExtras({ monthlyReminder })}
                        label="Lembrete Mensal"
                        disabled={!isAdmin}
                    />
                </FormRow>
            </FormSection>

            <FormSection title="Regras de Gestão & Foco">
                <FormRow
                    icon="♕"
                    label="Marcos de Conquista"
                    description="Feedback motivador a cada 25% completado"
                >
                    <GoalSwitch
                        value={extrasForm.extras.milestonesEnabled}
                        onValueChange={(milestonesEnabled) => extrasForm.onChangeExtras({ milestonesEnabled })}
                        label="Marcos de Conquista"
                        disabled={!isAdmin}
                    />
                </FormRow>
            </FormSection>

            <View style={styles.actionsCard}>
                <Pressable
                    onPress={onLeave}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityLabel="Sair desta Caixinha"
                    accessibilityState={{ disabled }}
                    style={({ pressed }) => [
                        styles.actionRow,
                        (pressed || disabled) && styles.disabled,
                    ]}
                >
                    <Text style={[styles.actionIcon, styles.primaryText]}>⇥</Text>
                    <Text style={[styles.actionLabel, styles.primaryText]}>
                        Sair desta Caixinha
                    </Text>
                </Pressable>

                {/* Só o Admin arquiva (L-17) */}
                {isAdmin && <View style={styles.divider} />}

                {isAdmin && (
                    <Pressable
                        onPress={onArchive}
                        disabled={disabled}
                        accessibilityRole="button"
                        accessibilityLabel="Encerrar e Arquivar Caixinha"
                        accessibilityState={{ disabled }}
                        style={({ pressed }) => [
                            styles.actionRow,
                            (pressed || disabled) && styles.disabled,
                        ]}
                    >
                        <Text style={[styles.actionIcon, styles.dangerText]}>⊠</Text>
                        <Text style={[styles.actionLabel, styles.dangerText]}>
                            Encerrar e Arquivar Caixinha
                        </Text>
                    </Pressable>
                )}
            </View>

            {/* Aviso do Figma */}
            <View style={styles.notice}>
                <Text style={styles.noticeIcon}>ⓘ</Text>
                <Text style={styles.noticeText}>
                    Este aplicativo realiza estritamente a gestão e controle
                    visual colaborativo de metas. Não custodia valores
                    financeiros nem transaciona dinheiro real entre contas
                    bancárias.
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

    manageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.lg,
    },

    manageIcon: {
        fontSize: fontSize.md,
        color: colors.primary,
    },

    manageLabel: {
        flex: 1,
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.primary,
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
    },

    actionLabel: {
        flex: 1,
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
    },

    primaryText: {
        color: colors.primary,
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
});
