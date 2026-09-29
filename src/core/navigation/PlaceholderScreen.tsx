import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Screen } from '@/core/components';
import { colors, spacing } from '@/core/theme';

type Link = { label: string; href?: Href; action?: () => void; replace?: boolean };

type Props = {
  title: string;
  figmaFrame: string;
  links?: Link[];
  showBack?: boolean;
};

/**
 * Tela provisória usada enquanto o visual do Figma não é implementado.
 * Mostra o nome do frame do Figma e botões para testar a navegação.
 */
export function PlaceholderScreen({ title, figmaFrame, links = [], showBack = true }: Props) {
  return (
    <Screen background={colors.background}>
      <View style={styles.header}>
        <AppText variant="h2">{title}</AppText>
        <AppText variant="caption" color="textMuted">
          Figma: {figmaFrame}
        </AppText>
      </View>
      <View style={styles.links}>
        {links.map((link) => (
          <Button
            key={link.label}
            title={link.label}
            variant="secondary"
            onPress={() => {
              if (link.action) return link.action();
              if (!link.href) return;
              if (link.replace) router.replace(link.href);
              else router.push(link.href);
            }}
          />
        ))}
        {showBack && router.canGoBack() && (
          <Button title="Voltar" variant="ghost" onPress={() => router.back()} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xxl, paddingBottom: spacing.xl, gap: spacing.xs },
  links: { gap: spacing.sm },
});
