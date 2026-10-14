import { StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
} from '../../../../core/theme';

import type { GoalRecord } from '../../domain/Goal';
import { formatCurrency } from '../utils/formatCurrency';

import { goalColors } from './goalColors';

type Props = {
    record: GoalRecord;
    /**
     * `contribution` segue o frame da Caixinha compartilhada,
     * com ícone de aporte em destaque.
     */
    variant?: 'history' | 'contribution';
};

/**
 * Item de registro (entrada ou retirada) da Caixinha.
 */
export function GoalRecordItem({ record, variant = 'history' }: Props) {
    const isDeposit = record.kind === 'deposit';
    const isContribution = variant === 'contribution';
    const icon = isContribution
        ? (isDeposit ? '↓' : '↑')
        : (isDeposit ? '↗' : '↙');
    const subtitle = record.memberName
        ? `${record.memberName} • ${record.dateLabel}`
        : record.dateLabel;
    const signedAmount = isDeposit ? record.amount : -record.amount;
    const amountLabel = `${isDeposit ? '+ ' : ''}${formatCurrency(signedAmount)}`;

    return (
        <View
            style={styles.row}
            accessibilityLabel={`${isDeposit ? 'Entrada' : 'Retirada'}: ${record.description}, ${subtitle}, ${amountLabel}`}
        >
            <View
                style={[
                    styles.iconCircle,
                    isContribution && styles.iconCircleContribution,
                ]}
            >
                <Text style={styles.icon}>{icon}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.description} numberOfLines={2}>
                    {record.description}
                </Text>
                <Text style={styles.date}>{subtitle}</Text>
            </View>

            <Text
                style={[
                    styles.amount,
                    !isDeposit && styles.amountWithdrawal,
                ]}
            >
                {amountLabel}
            </Text>
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

    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: radius.full,
        backgroundColor: goalColors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },

    iconCircleContribution: {
        backgroundColor: '#FFDCD0',
    },

    icon: {
        fontSize: fontSize.md,
        color: colors.primary,
    },

    content: {
        flex: 1,
        gap: spacing.xxs,
    },

    description: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    date: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    amount: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.primary,
    },

    amountWithdrawal: {
        color: colors.status.error,
    },
});
