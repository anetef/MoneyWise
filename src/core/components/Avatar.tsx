import { StyleSheet, View } from 'react-native';

import { colors, fonts, radius } from '@/core/theme';
import { initials } from '@/core/utils/format';
import { AppText } from './AppText';

const palette = ['#823B18', '#A0522D', '#6B3E26', '#B5876B', '#72442B', '#54433C'];

function colorFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length]!;
}

/** Avatar redondo com as iniciais do nome (cor estável por pessoa). */
export function Avatar({ name, size = 40, ring = false }: { name: string; size?: number; ring?: boolean }) {
  return (
    <View
      accessibilityLabel={name}
      style={[
        styles.base,
        { width: size, height: size, backgroundColor: colorFor(name) },
        ring && styles.ring,
      ]}
    >
      <AppText
        style={{ color: colors.white, fontFamily: fonts.semibold, fontSize: Math.round(size * 0.38) }}
      >
        {initials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  ring: { borderWidth: 2, borderColor: colors.white },
});
