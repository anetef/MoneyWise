import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
} from '../../../../core/theme';

import type { GoalMember } from '../../domain/Goal';
import { formatCurrency } from '../utils/formatCurrency';
import { getInitials } from '../utils/getInitials';

import { goalColors } from './goalColors';

type Props = {
    member: GoalMember;
    /** Só o Admin vê o ⋮, e só nos outros membros. Sem isso, o ⋮ some. */
    onRemove?: () => void;
    /** Trava o ⋮ enquanto uma operação está em andamento. */
    disabled?: boolean;
};

// Papéis da arquitetura; Criador/Editor/Leitor do Figma dependem de L-10.
const roleLabels: Record<GoalMember['role'], string> = {
    admin: 'Admin',
    member: 'Membro',
};

/**
 * Membro na lista das Configurações da Caixinha compartilhada:
 * papel e valor registrado. O ⋮ remove o membro (só o Admin,
 * RN04); para quem não pode remover, ele não aparece.
 */
export function MemberSettingsItem({ member, onRemove, disabled = false }: Props) {
    const name = member.isCurrentUser ? `${member.name} (Você)` : member.name;
    const role = roleLabels[member.role];
    const amount = formatCurrency(member.contributedAmount);
    const isAdmin = member.role === 'admin';

    return (
        <View style={styles.row}>
            {/* Iniciais no lugar da foto */}
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(member.name)}</Text>
            </View>

            <View
                style={styles.content}
                accessible
                accessibilityLabel={`${name}, ${role}, registrou ${amount}`}
            >
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {name}
                    </Text>

                    <View style={[styles.badge, isAdmin && styles.badgeAdmin]}>
                        <Text
                            style={[styles.badgeText, isAdmin && styles.badgeTextAdmin]}
                        >
                            {isAdmin ? role.toUpperCase() : role}
                        </Text>
                    </View>
                </View>

                <Text style={styles.amount}>Registrou: {amount}</Text>
            </View>

            {onRemove ? (
                <Pressable
                    onPress={onRemove}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityLabel={`Remover ${member.name} da Caixinha`}
                    accessibilityState={{ disabled }}
                    hitSlop={spacing.md}
                    style={({ pressed }) => [
                        styles.menuButton,
                        (pressed || disabled) && styles.disabled,
                    ]}
                >
                    <Text style={styles.menuIcon}>⋮</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
    },

    disabled: {
        opacity: 0.5,
    },

    avatar: {
        width: 40,
        height: 40,
        borderRadius: radius.full,
        backgroundColor: goalColors.primaryTint,
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.primary,
    },

    content: {
        flex: 1,
        gap: spacing.xxs,
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    name: {
        flexShrink: 1,
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    badge: {
        backgroundColor: colors.border.default,
        borderRadius: radius.xs,
        paddingHorizontal: spacing.xs,
        paddingVertical: 1,
    },

    badgeAdmin: {
        backgroundColor: colors.primary,
    },

    badgeText: {
        fontFamily: fontFamily.medium,
        fontSize: 10,
        color: colors.text.secondary,
    },

    badgeTextAdmin: {
        fontFamily: fontFamily.bold,
        letterSpacing: 0.4,
        color: colors.text.inverse,
    },

    amount: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    menuButton: {
        width: 32,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    menuIcon: {
        fontSize: fontSize.lg,
        fontFamily: fontFamily.bold,
        color: colors.text.secondary,
    },
});
