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
import { GoalBasicsFields } from './GoalBasicsFields';
import { MemberSettingsItem } from './MemberSettingsItem';

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
    onInvite: () => void;
    onManageMember: (member: GoalMember) => void;
    onManageInvites: () => void;
    onLeave: () => void;
    onArchive: () => void;
};

/**
 * Conteúdo das Configurações de uma Caixinha compartilhada
 * (frame "Caixinha - Configurações (Compartilhada)").
 *
 * Os campos comuns ficam em GoalBasicsFields. Membros e papéis
 * vêm do mock e são apenas exibidos: gerenciar membros,
 * permissões e regras do grupo depende de L-09 e L-10.
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
    onInvite,
    onManageMember,
    onManageInvites,
    onLeave,
    onArchive,
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
                title={`Membros da Caixinha (${goal.members.length})`}
                asideAction={{ label: '+ Convidar', onPress: onInvite }}
            >
                {goal.members.map((member) => (
                    <MemberSettingsItem
                        key={member.id}
                        member={member}
                        onOpenMenu={() => onManageMember(member)}
                    />
                ))}

                {/* Gerenciar convites e permissões depende de L-05 e L-10 */}
                <Pressable
                    onPress={onManageInvites}
                    accessibilityRole="button"
                    accessibilityLabel="Gerenciar convites e permissões, em breve"
                    style={({ pressed }) => [styles.manageRow, pressed && styles.pressed]}
                >
                    <Text style={styles.manageIcon}>⇄</Text>
                    <Text style={styles.manageLabel}>
                        Gerenciar convites e permissões
                    </Text>
                    <Text style={styles.manageIcon}>→</Text>
                </Pressable>
            </FormSection>

            <FormSection title="Regras & Governança">
                {/*
                 * Texto mantido como no Figma. Pendente para o grupo:
                 * na caixinha os registros são aportes e retiradas,
                 * não gastos ou despesas.
                 */}
                <FormRow
                    label="Permitir registro de gastos"
                    description="Todos os membros podem lançar despesas"
                    comingSoon
                >
                    <DisabledSwitch />
                </FormRow>

                <FormRow label="Notificar novos registros no grupo" comingSoon>
                    <DisabledSwitch />
                </FormRow>
            </FormSection>

            <FormSection title="Rotina & Lembretes">
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

            {/* Sair do grupo e arquivar dependem de L-09 */}
            <View style={styles.actionsCard}>
                <Pressable
                    onPress={onLeave}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
                >
                    <Text style={[styles.actionIcon, styles.primaryText]}>⇥</Text>
                    <Text style={[styles.actionLabel, styles.primaryText]}>
                        Sair desta Caixinha
                    </Text>
                </Pressable>

                <View style={styles.divider} />

                <Pressable
                    onPress={onArchive}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
                >
                    <Text style={[styles.actionIcon, styles.dangerText]}>⊠</Text>
                    <Text style={[styles.actionLabel, styles.dangerText]}>
                        Encerrar e Arquivar Caixinha
                    </Text>
                </Pressable>
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

    pressed: {
        opacity: 0.7,
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
