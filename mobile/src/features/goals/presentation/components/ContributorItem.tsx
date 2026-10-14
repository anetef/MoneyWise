import { StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
} from '../../../../core/theme';

import type { GoalMember } from '../../domain/Goal';
import { formatCurrency } from '../utils/formatCurrency';

import { goalColors } from './goalColors';

type Props = {
    member: GoalMember;
};

const roleLabels: Record<GoalMember['role'], string> = {
    admin: 'Admin',
    member: 'Membro',
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

/**
 * Participante da Caixinha com o valor aportado e a
 * participação no total (RF-14), sem saldo pessoal (RN08).
 */
export function ContributorItem({ member }: Props) {
    const name = member.isCurrentUser ? `${member.name} (Você)` : member.name;
    const amount = formatCurrency(member.contributedAmount, { compact: true });

    return (
        <View
            style={styles.row}
            accessibilityLabel={`${name}, ${roleLabels[member.role]}, aportou ${amount}, ${member.sharePercent}% do total`}
        >
            {/* Iniciais no lugar da foto */}
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(member.name)}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>
                    {name}
                </Text>
                <Text style={styles.role}>{roleLabels[member.role]}</Text>
            </View>

            <View style={styles.amountArea}>
                <Text style={styles.amount}>{amount}</Text>
                <Text style={styles.share}>{member.sharePercent}% do total</Text>
            </View>
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

    name: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    role: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    amountArea: {
        alignItems: 'flex-end',
        gap: spacing.xxs,
    },

    amount: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    share: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },
});
