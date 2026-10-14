import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../../../../core/theme';

import type { GoalProgress } from '../../domain/Goal';

type Props = {
    progress: GoalProgress;
    /** `bar` para listas e cartões; `ring` para o anel dos detalhes. */
    variant?: 'bar' | 'ring';
    /** Altura da barra. */
    height?: number;
    /** Diâmetro do anel. */
    size?: number;
    /** Espessura do anel. */
    strokeWidth?: number;
    /** Conteúdo exibido no centro do anel. */
    children?: ReactNode;
};

/**
 * Indicador visual do progresso da Caixinha (RF-17).
 *
 * Exibe o percentual recebido do backend (RN01),
 * sem calcular o status no aplicativo.
 */
export function Thermometer({
    progress,
    variant = 'bar',
    height = 8,
    size = 200,
    strokeWidth = 16,
    children,
}: Props) {
    const percent = Math.min(Math.max(progress.percent, 0), 100);

    if (variant === 'ring') {
        return (
            <ProgressRing percent={percent} size={size} strokeWidth={strokeWidth}>
                {children}
            </ProgressRing>
        );
    }

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

type RingProps = {
    percent: number;
    size: number;
    strokeWidth: number;
    children?: ReactNode;
};

/**
 * Anel de progresso feito apenas com Views, sem dependências.
 *
 * Cada metade do círculo mostra um semicírculo colorido
 * girado conforme o percentual: a metade direita cobre
 * de 0% a 50% e a esquerda, de 50% a 100%.
 */
function ProgressRing({ percent, size, strokeWidth, children }: RingProps) {
    const angle = (percent / 100) * 360;
    const rightAngle = Math.min(angle, 180);
    const leftAngle = Math.max(angle - 180, 0);
    const half = size / 2;

    const ring = {
        width: size,
        height: size,
        borderRadius: half,
        borderWidth: strokeWidth,
    };

    // Bordas superior e esquerda coloridas formam um semicírculo
    // após a rotação de 45° (os cantos dividem as bordas na diagonal).
    const semicircle = {
        ...ring,
        borderTopColor: colors.primary,
        borderLeftColor: colors.primary,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
    };

    return (
        <View
            style={{ width: size, height: size }}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: percent }}
        >
            <View style={[ring, styles.ringTrack]} />

            {/* Metade direita: 0% a 50% */}
            <View style={[styles.half, { left: half, width: half, height: size }]}>
                {rightAngle > 0 && (
                    <View
                        style={[
                            semicircle,
                            styles.absolute,
                            {
                                left: -half,
                                transform: [{ rotate: `${-45 + rightAngle}deg` }],
                            },
                        ]}
                    />
                )}
            </View>

            {/* Metade esquerda: 50% a 100% */}
            <View style={[styles.half, { left: 0, width: half, height: size }]}>
                {leftAngle > 0 && (
                    <View
                        style={[
                            semicircle,
                            styles.absolute,
                            {
                                left: 0,
                                transform: [{ rotate: `${135 + leftAngle}deg` }],
                            },
                        ]}
                    />
                )}
            </View>

            <View style={[styles.center, { padding: strokeWidth }]}>{children}</View>
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

    ringTrack: {
        position: 'absolute',
        borderColor: colors.border.default,
    },

    half: {
        position: 'absolute',
        top: 0,
        overflow: 'hidden',
    },

    absolute: {
        position: 'absolute',
        top: 0,
    },

    center: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
