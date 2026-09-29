import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/core/theme';

type Segment = { value: number; color: string };

type Props = {
  size: number;
  strokeWidth: number;
  /** Progresso de 0 a 1 (anel simples) … */
  progress?: number;
  /** … ou vários segmentos (gráfico de rosca por categoria). Valores somam até 1. */
  segments?: Segment[];
  color?: string;
  trackColor?: string;
  children?: ReactNode;
};

/**
 * Anel de progresso (termômetro da caixinha) e gráfico de rosca (Dashboard).
 * Começa no topo e cresce no sentido horário, como no Figma.
 */
export function ProgressRing({
  size,
  strokeWidth,
  progress = 0,
  segments,
  color = colors.primary,
  trackColor = colors.border,
  children,
}: Props) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const parts = segments ?? [{ value: progress, color }];

  let offset = 0;
  const arcs = parts.map((seg, i) => {
    const value = Math.min(Math.max(seg.value, 0), 1 - offset);
    const arc = (
      <Circle
        key={i}
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={seg.color}
        strokeWidth={strokeWidth}
        strokeLinecap={parts.length === 1 ? 'round' : 'butt'}
        fill="none"
        strokeDasharray={`${value * c} ${c}`}
        strokeDashoffset={-offset * c}
      />
    );
    offset += value;
    return arc;
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        {arcs}
      </Svg>
      {children && <View style={styles.center}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
