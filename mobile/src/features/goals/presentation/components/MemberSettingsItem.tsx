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
    onOpenMenu: () => void;
};

// Papéis da arquitetura; Criador/Editor/Leitor do Figma dependem de L-10.
const roleLabels: Record<GoalMember['role'], string> = {
    admin: 'Admin',
    member: 'Membro',
};

/**
 * Membro na lista das Configurações da Caixinha compartilhada:
 * papel e valor registrado. O menu ⋮ ainda não tem ações (L-10).
 */
export function MemberSettingsItem({ member, onOpenMenu }: Props) {
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

            <Pressable
                onPress={onOpenMenu}
                accessibilityRole="button"
                accessibilityLabel={`Opções de ${member.name}, em breve`}
                hitSlop={spacing.md}
                style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
            >
                <Text style={styles.menuIcon}>⋮</Text>
            </Pressable>
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

    pressed: {
        opacity: 0.7,
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
        width: 24,
        alignItems: 'center',
    },

    menuIcon: {
        fontSize: fontSize.lg,
        fontFamily: fontFamily.bold,
        color: colors.text.secondary,
    },
});
