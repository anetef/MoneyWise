import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText, Button, Card, IconButton, Screen } from '@/core/components';
import { routes } from '@/core/navigation/routes';
import { colors, fonts, radius, spacing } from '@/core/theme';
import { getErrorMessage } from '@/core/utils/errors';
import { useAuth } from '../AuthContext';

/** Figma: "Recuperar Senha" */
export function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backToLogin = () => (router.canGoBack() ? router.back() : router.replace(routes.signIn));

  async function handleSend() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Digite um e-mail válido.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen background={colors.backgroundAlt}>
      <View style={styles.topBar}>
        <IconButton icon="arrow-back" variant="tint" accessibilityLabel="Voltar para o login" onPress={backToLogin} />
      </View>

      <Card padding={spacing.xl} style={styles.hero}>
        <View style={styles.emblemRing}>
          <View style={styles.emblem}>
            <MaterialIcons name={sent ? 'mark-email-read' : 'lock-reset'} size={30} color={colors.white} />
          </View>
        </View>
        <AppText variant="h2" color="textStrong" align="center">
          {sent ? 'Verifique seu e-mail' : 'Recuperar acesso'}
        </AppText>
        <AppText color="textBody" align="center" style={styles.heroText}>
          {sent
            ? `Enviamos um link para ${email.trim()}. Abra o e-mail e siga as instruções para criar uma nova senha.`
            : 'Digite seu e-mail cadastrado e enviaremos um link seguro para redefinir sua senha.'}
        </AppText>
      </Card>

      {!sent && (
        <Card padding={spacing.xl} style={styles.formCard}>
          <View style={styles.labelRow}>
            <AppText variant="button" color="textStrong">
              E-mail cadastrado
            </AppText>
            <AppText variant="label" color="textSubtle">
              exemplo@email.com
            </AppText>
          </View>
          <View style={styles.inputWrap}>
            <MaterialIcons name="mail-outline" size={18} color={colors.textSubtle} style={styles.inputIcon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu.email@provedor.com"
              placeholderTextColor={colors.textSubtle}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              accessibilityLabel="E-mail cadastrado"
              style={styles.input}
              onSubmitEditing={handleSend}
            />
          </View>
          {error && (
            <AppText variant="caption" style={styles.error} accessibilityRole="alert">
              {error}
            </AppText>
          )}
          <Button
            title="Enviar link de recuperação"
            leadingIcon="send"
            radiusSize="sm"
            loading={loading}
            onPress={handleSend}
            style={styles.send}
          />
        </Card>
      )}

      <Button
        title="Voltar para o login"
        variant="surface"
        leadingIcon="arrow-back"
        radiusSize="sm"
        onPress={backToLogin}
        style={styles.back}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingVertical: spacing.sm },
  hero: { marginTop: spacing.lg, alignItems: 'center' },
  emblemRing: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(130,59,24,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emblem: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { marginTop: spacing.xs, maxWidth: 320 },
  formCard: { marginTop: spacing.lg },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputWrap: { marginTop: 6, justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 14, zIndex: 1 },
  input: {
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceTint,
    paddingLeft: 44,
    paddingRight: spacing.lg,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textStrong,
    outlineStyle: 'none',
  } as object,
  error: { color: colors.danger, marginTop: spacing.xs },
  send: { marginTop: spacing.lg },
  back: { marginTop: spacing.xl + spacing.lg, alignSelf: 'center', width: '100%', maxWidth: 320 },
});
