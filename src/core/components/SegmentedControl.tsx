import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows } from '@/core/theme';
import { AppText } from './AppText';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 'gray' = Extrato/Caixinhas (fundo cinza); 'tint' = Nova Caixinha */
  tone?: 'gray' | 'tint';
};

/** Seletor em abas ("Tudo | Entradas | Saídas", "Individuais | Compartilhadas"). */
export function SegmentedControl<T extends string>({ options, value, onChange, tone = 'gray' }: Props<T>) {
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.track, { backgroundColor: tone === 'gray' ? colors.chip : colors.surfaceTintStrong }]}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(opt.value)}
            style={[styles.item, active && [styles.active, shadows.card]]}
          >
            <AppText variant="headline" color={active ? (tone === 'gray' ? 'text' : 'primary') : 'textMuted'}>
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 4, borderRadius: radius.sm },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderRadius: 6 },
  active: { backgroundColor: colors.background },
});
