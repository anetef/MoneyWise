import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/core/theme';
import { AppText } from './AppText';

type Props = {
  title?: string;
  /** 'large' = título grande em terracota (Dashboard, Caixinhas, Perfil). */
  variant?: 'back' | 'large';
  onBack?: () => void;
  right?: ReactNode;
  backColor?: string;
  titleAlign?: 'left' | 'center';
};

/** Barra superior das telas (64px), com botão voltar ou título grande. */
export function TopBar({
  title,
  variant = 'back',
  onBack,
  right,
  backColor = colors.textStrong,
  titleAlign = 'left',
}: Props) {
  if (variant === 'large') {
    return (
      <View style={[styles.bar, styles.shadow]}>
        <AppText variant="h3" color="primary">
          {title}
        </AppText>
        {right}
      </View>
    );
  }

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={12}
          onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
          style={styles.back}
        >
          <MaterialIcons name="arrow-back-ios-new" size={20} color={backColor} />
        </Pressable>
        {title && titleAlign === 'left' && (
          <AppText variant="headline" color="text">
            {title}
          </AppText>
        )}
      </View>
      {title && titleAlign === 'center' && (
        <AppText variant="title" color="textStrong" style={styles.centerTitle}>
          {title}
        </AppText>
      )}
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 64,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shadow: { backgroundColor: 'rgba(249,249,254,0.8)' },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, zIndex: 1 },
  back: { width: 28, height: 44, justifyContent: 'center' },
  centerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center' },
  right: { minWidth: 28, alignItems: 'flex-end', zIndex: 1 },
});
