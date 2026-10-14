import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../../../../core/theme';

import type { GoalProgress } from '../../domain/Goal';

type Props = {
    progress: GoalProgress;
    height?: number;
};

/**
 * Indicador visual do progresso da Caixinha (RF-17).
 *
 * Exibe o percentual recebido do backend (RN01),
 * sem calcular o status no aplicativo.
 */
export function Thermometer({ progress, height = 8 }: Props) {
    const percent = Math.min(Math.max(progress.percent, 0), 100);

    return (
        <View
            style={[styles.track, { height, borderRadius: height / 2 }]}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: percent }}
        >
            <View
                style={[
                    styles.fill,
                    {
                        width: `${percent}%`,
                        borderRadius: height / 2,
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        width: '100%',
        backgroundColor: colors.border.default,
        borderRadius: radius.full,
        overflow: 'hidden',
    },

    fill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
});
