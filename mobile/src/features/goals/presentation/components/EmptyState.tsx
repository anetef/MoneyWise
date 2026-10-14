import { StyleSheet, Text, View } from 'react-native';

import {
    colors,
    radius,
    spacing,
    typography,
} from '../../../../core/theme';

type Props = {
    title: string;
    description: string;
};

/**
 * Mensagem exibida quando não há itens para mostrar.
 */
export function EmptyState({ title, description }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>◎</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: colors.surface.primary,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border.default,
        paddingVertical: spacing.huge,
        paddingHorizontal: spacing.xxl,
        gap: spacing.sm,
    },

    icon: {
        fontSize: 32,
        color: colors.primary,
    },

    title: {
        ...typography.subtitle,
        color: colors.text.primary,
        textAlign: 'center',
    },

    description: {
        ...typography.caption,
        color: colors.text.secondary,
        textAlign: 'center',
    },
});
