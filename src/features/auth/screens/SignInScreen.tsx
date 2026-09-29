import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  FormField,
  FormGroup,
  Screen,
  SocialButtons,
  TextDivider,
  TopBar,
} from '@/core/components';
import { routes } from '@/core/navigation/routes';
import { colors, radius, shadows, spacing } from '@/core/theme';
import { getErrorMessage } from '@/core/utils/errors';
import { useAuth } from '../AuthContext';

/** Figma: "Entrar na Conta" (UC01) */
export function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn({ email, password });
      // Não precisa navegar: o layout raiz troca para o app quando o login conclui.
    } catch (e) {
      setError(getErrorMessage(e));
      setLoading(false);
    }
  }

  return (
    <Screen header={<TopBar />}>
      <View style={styles.header}>
        <View style={[styles.logo, shadows.card]}>
          <MaterialCommunityIcons name="piggy-bank" size={28} color="#F2E3D9" />
        </View>
        <AppText variant="h2" color="textStrong" align="center">
          Bem-vindo de volta
        </AppText>
        <AppText color="textBody" align="center" style={styles.subtitle}>
          Acesse sua conta para gerenciar seus gastos e caixinhas.
        </AppText>
      </View>

      <FormGroup tone="tint">
        <FormField
          layout="inline"
          icon="at"
          label="E-mail ou telefone"
          placeholder="seuemail@exemplo.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
          returnKeyType="next"
        />
        <FormField
          layout="inline"
          icon="lock-outline"
          label="Senha"
          placeholder="••••••••"
          secure
          autoComplete="password"
          textContentType="password"
          value={password}
          onChangeText={setPassword}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
      </FormGroup>

      <View style={styles.options}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: remember }}
          onPress={() => setRemember((r) => !r)}
          style={styles.remember}
        >
          <View style={[styles.checkbox, remember && styles.checkboxOn]}>
            {remember && <MaterialIcons name="check" size={14} color={colors.primary} />}
          </View>
          <AppText variant="footnote" color="textBody">
            Lembrar de mim
          </AppText>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={() => router.push(routes.forgotPassword)} hitSlop={8}>
          <AppText variant="footnote" color="primary">
            Esqueci minha senha
          </AppText>
        </Pressable>
      </View>

      {error && (
        <AppText variant="callout" style={styles.error} accessibilityRole="alert">
          {error}
        </AppText>
      )}

      <Button
        title="Entrar na conta"
        trailingIcon="arrow-forward"
        loading={loading}
        onPress={handleSubmit}
        style={styles.submit}
        testID="signin-submit"
      />

      <View style={styles.social}>
        <TextDivider label="Ou continue com" />
        <SocialButtons tone="surface" />
      </View>

      <View style={styles.footer}>
        <AppText color="textBody">Ainda não tem conta?</AppText>
        <Pressable accessibilityRole="link" onPress={() => router.replace(routes.signUp)} hitSlop={8}>
          <AppText variant="button" color="primary">
            Criar nova conta
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: { marginTop: 5, maxWidth: 280, lineHeight: 24 },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    marginTop: spacing.lg,
  },
  remember: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    backgroundColor: colors.borderTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.borderTint },
  error: { color: colors.danger, marginTop: spacing.md, textAlign: 'center' },
  submit: { marginTop: spacing.xl },
  social: { marginTop: spacing.xl, gap: spacing.xl },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xxl,
  },
});
