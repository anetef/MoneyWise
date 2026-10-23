import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    shadows,
    spacing,
} from '../../../../core/theme';

type AsideAction = {
    label: string;
    onPress: () => void;
};

type Props = {
    title: string;
    aside?: string;
    asideTone?: 'muted' | 'primary';
    /** Ação de texto ao lado do título (ex.: "+ Convidar"). */
    asideAction?: AsideAction;
    children: ReactNode;
};

/**
 * Seção de formulário com título e cartão de linhas.
 */
export function FormSection({
    title,
    aside,
    asideTone = 'muted',
    asideAction,
    children,
}: Props) {
    const rows = Children.toArray(children);

    return (
        <View style={styles.section}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>

                {aside && (
                    <Text
                        style={[
                            styles.aside,
                            asideTone === 'primary' && styles.asidePrimary,
                        ]}
                    >
                        {aside}
                    </Text>
                )}

                {asideAction && (
                    <Pressable
                        onPress={asideAction.onPress}
                        accessibilityRole="button"
                        hitSlop={spacing.sm}
                        style={({ pressed }) => pressed && styles.pressed}
                    >
                        <Text style={styles.asideAction}>{asideAction.label}</Text>
                    </Pressable>
                )}
            </View>

            <View style={styles.card}>
                {rows.map((row, index) => (
                    <Fragment key={index}>
                        {index > 0 && <View style={styles.divider} />}
                        {row}
                    </Fragment>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: spacing.sm,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.sm,
    },

    title: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        color: colors.text.secondary,
    },

    aside: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    asidePrimary: {
        color: colors.primary,
    },

    asideAction: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        color: colors.primary,
    },

    pressed: {
        opacity: 0.7,
    },

    card: {
        backgroundColor: colors.surface.primary,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        ...shadows.sm,
    },

    divider: {
        height: 1,
        backgroundColor: colors.border.subtle,
    },
});
