import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../../../../core/theme';
import { GOAL_ICON_OPTIONS } from '../utils/goalOptions';

type Props = {
    value: string | null;
    onChange: (icon: string) => void;
};

/** Grade de ícones da Caixinha (L-08), aberta ao tocar no ícone. */
export function GoalIconGrid({ value, onChange }: Props) {
    return (
        <View style={styles.grid}>
            {GOAL_ICON_OPTIONS.map((option) => {
                const selected = option.value === value;

                return (
                    <Pressable
                        key={option.value}
                        onPress={() => onChange(option.value)}
                        accessibilityRole="button"
                        accessibilityLabel={`Ícone ${option.label}`}
                        accessibilityState={{ selected }}
                        aria-selected={selected}
                        style={({ pressed }) => [
                            styles.option,
                            selected && styles.selected,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.emoji}>{option.emoji}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.md,
        maxWidth: 4 * 56 + 3 * spacing.md,
        alignSelf: 'center',
    },

    option: {
        width: 56,
        height: 56,
        borderRadius: radius.full,
        backgroundColor: colors.surface.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },

    selected: {
        borderColor: colors.primary,
        backgroundColor: colors.white,
    },

    emoji: {
        fontSize: 26,
    },

    pressed: {
        opacity: 0.7,
    },
});
