import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/core/theme';

type Props = {
  children: ReactNode;
  /** Rola o conteúdo quando ele não cabe na tela (padrão: true). */
  scroll?: boolean;
  background?: string;
  /** Conteúdo fixo no rodapé (ex.: botão "Continuar"). */
  footer?: ReactNode;
  /** Conteúdo fixo no topo (ex.: barra com botão voltar). */
  header?: ReactNode;
  contentStyle?: ViewStyle;
  edges?: Edge[];
};

/**
 * Container base de toda tela: respeita a área segura (notch), aplica o fundo
 * do tema, a margem lateral de 16px e sobe o conteúdo quando o teclado abre.
 */
export function Screen({
  children,
  scroll = true,
  background = colors.surface,
  footer,
  header,
  contentStyle,
  edges = ['top', 'bottom'],
}: Props) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flex, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: background }]} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {header}
        {content}
        {footer && <View style={styles.footer}>{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
});
