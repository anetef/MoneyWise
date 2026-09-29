import { StyleSheet, View } from 'react-native';

import { AppText, Button } from '@/core/components';
import { colors, spacing } from '@/core/theme';

/** Tela temporária: confirma que o tema e as fontes estão funcionando. */
export default function Index() {
  return (
    <View style={styles.container}>
      <AppText variant="h1" color="primary">
        MoneyWise
      </AppText>
      <AppText color="textMuted">Projeto configurado com Expo + React + TypeScript.</AppText>
      <Button title="Tema Terracotta" trailingIcon="arrow-forward" style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  button: { alignSelf: 'stretch' },
});
