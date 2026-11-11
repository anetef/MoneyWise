import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
} from '../../../../core/theme';
import { GOAL_CATEGORY_OPTIONS } from '../utils/goalOptions';

type Props = {
    value: string | null;
    /** Tocar na categoria já escolhida tira a categoria. */
    onChange: (category: string | null) => void;
};

/** Categorias da Caixinha (L-08), abertas pela linha "Categoria". */
export function GoalCategoryChips({ value, onChange }: Props) {
    return (
        <View style={styles.list}>
            {GOAL_CATEGORY_OPTIONS.map((category) => {
                const selected = category === value;

                return (
                    <Pressable
                        key={category}
                        onPress={() => onChange(selected ? null : category)}
                        accessibilityRole="button"
                        accessibilityLabel={`Categoria ${category}`}
                        accessibilityState={{ selected }}
                        aria-selected={selected}
                        style={({ pressed }) => [
                            styles.chip,
                            selected && styles.chipSelected,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                            {category}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    list: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        paddingBottom: spacing.lg,
    },

    chip: {
        minHeight: 36,
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        borderRadius: radius.full,
        backgroundColor: colors.surface.secondary,
    },

    chipSelected: {
        backgroundColor: colors.primary,
    },

    chipText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    chipTextSelected: {
        color: colors.white,
    },

    pressed: {
        opacity: 0.7,
    },
});
