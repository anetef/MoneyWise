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
};

/**
 * Item de registro (entrada ou retirada) da Caixinha.
 */
export function GoalRecordItem({ record }: Props) {
    const isDeposit = record.kind === 'deposit';
    const signedAmount = isDeposit ? record.amount : -record.amount;
    const amountLabel = `${isDeposit ? '+ ' : ''}${formatCurrency(signedAmount)}`;

    return (
        <View
            style={styles.row}
            accessibilityLabel={`${isDeposit ? 'Entrada' : 'Retirada'}: ${record.description}, ${record.dateLabel}, ${amountLabel}`}
        >
            <View style={styles.iconCircle}>
                <Text style={styles.icon}>{isDeposit ? '↗' : '↙'}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.description} numberOfLines={2}>
                    {record.description}
                </Text>
                <Text style={styles.date}>{record.dateLabel}</Text>
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
