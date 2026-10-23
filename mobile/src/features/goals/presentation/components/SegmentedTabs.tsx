import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
} from '../../../../core/theme';

type Option<T extends string> = {
    value: T;
    label: string;
};

type Props<T extends string> = {
    options: Option<T>[];
    selected: T;
    onChange: (value: T) => void;
};

/**
 * Seletor de abas em formato segmentado.
 */
export function SegmentedTabs<T extends string>({
    options,
    selected,
    onChange,
}: Props<T>) {
    return (
        <View style={styles.container} accessibilityRole="tablist">
            {options.map((option) => {
                const isSelected = option.value === selected;

                return (
                    <Pressable
                        key={option.value}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => onChange(option.value)}
                        style={[
                            styles.option,
                            isSelected && styles.optionSelected,
                        ]}
                    >
                        <Text
                            style={[
                                styles.label,
                                isSelected && styles.labelSelected,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.surface.secondary,
        borderRadius: radius.md,
        padding: spacing.xs,
    },

    option: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderRadius: radius.sm,
    },

    optionSelected: {
        backgroundColor: colors.surface.primary,
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
    },

    label: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },

    labelSelected: {
        fontFamily: fontFamily.semiBold,
        color: colors.text.primary,
    },
});
