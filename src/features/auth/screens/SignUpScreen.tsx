import { MaterialIcons } from '@expo/vector-icons';
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
import { colors, fonts, radius, spacing } from '@/core/theme';
import { getErrorMessage } from '@/core/utils/errors';
import { showMessage } from '@/core/utils/feedback';
import { useAuth } from '../AuthContext';

/** Força da senha de 0 a 4 (preenche as 4 barrinhas do Figma). */
export function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score++;
  return password ? Math.max(score, 1) : 0;
}

const strengthColors = ['#E5EEFF', colors.danger, colors.warning, colors.successLight, colors.success];

type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirm' | 'terms' | 'form', string>>;

/** Figma: "Criar Nova Conta" (UC01 / RF-01, RF-02) */
export function SignUpScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = 'Informe seu nome.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = 'Digite um e-mail válido.';
    if (password.length < 8) e.password = 'A senha precisa ter pelo menos 8 caracteres.';
    if (confirm !== password) e.confirm = 'As senhas não conferem.';
    if (!accepted) e.terms = 'Aceite os Termos de Uso para continuar.';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await signUp({ name, email, password });
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
      setLoading(false);
    }
  }

  return (
    <Screen header={<TopBar />}>
      <View style={styles.header}>
        <AppText variant="h1" color="textStrong">
          Criar sua conta
        </AppText>
        <AppText color="textSecondary" style={styles.subtitle}>
          Junte-se para organizar suas finanças pessoais e planejar metas conjuntas com quem você confia.
        </AppText>
      </View>

      <FormGroup>
        <FormField
          icon="account-outline"
          label="Nome completo"
          placeholder="Ex: Maria Silva"
          autoComplete="name"
          textContentType="name"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />
        <FormField
          icon="email-outline"
          label="E-mail"
          placeholder="seuemail@exemplo.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />
        <FormField
          icon="lock-outline"
          label="Senha"
          hint="Mínimo 8 caracteres"
          placeholder="Digite uma senha forte"
          secure
          autoComplete="new-password"
          textContentType="newPassword"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          footer={
            <View style={styles.meter} accessibilityLabel={`Força da senha: ${strength} de 4`}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.meterBar,
                    { backgroundColor: i <= strength ? strengthColors[strength] : strengthColors[0] },
                  ]}
                />
              ))}
            </View>
          }
        />
        <FormField
          icon="check-circle-outline"
          label="Confirmar senha"
          placeholder="Repita sua senha"
          secure
          autoComplete="new-password"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
        />
      </FormGroup>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        onPress={() => setAccepted((a) => !a)}
        style={styles.terms}
      >
        <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
          {accepted && <MaterialIcons name="check" size={14} color={colors.white} />}
        </View>
        <AppText variant="footnote" color="textSecondary" style={styles.termsText}>
          Li e concordo com os{' '}
          <AppText
            variant="footnote"
            color="primary"
            style={styles.link}
            onPress={() => showMessage('Termos de Uso', 'Documento em elaboração pela equipe.')}
          >
            Termos de Uso
          </AppText>{' '}
          e a{' '}
          <AppText
            variant="footnote"
            color="primary"
            style={styles.link}
            onPress={() => showMessage('Política de Privacidade', 'Documento em elaboração pela equipe.')}
          >
            Política de Privacidade
          </AppText>{' '}
          do MoneyWise.
        </AppText>
      </Pressable>
      {errors.terms && <AppText variant="caption" style={styles.error}>{errors.terms}</AppText>}
      {errors.form && (
        <AppText variant="callout" style={[styles.error, styles.formError]} accessibilityRole="alert">
          {errors.form}
        </AppText>
      )}

      <Button
        title="Criar conta gratuita"
        trailingIcon="arrow-forward"
        loading={loading}
        onPress={handleSubmit}
        style={styles.submit}
        testID="signup-submit"
      />

      <View style={styles.social}>
        <TextDivider label="Ou cadastre-se com" />
        <SocialButtons />
      </View>

      <View style={styles.footer}>
        <AppText color="textSecondary">Já tem uma conta?</AppText>
        <Pressable accessibilityRole="link" onPress={() => router.replace(routes.signIn)} hitSlop={8}>
          <AppText variant="button" color="primary">
            Entrar
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xl, paddingBottom: spacing.xl, gap: 3 },
  subtitle: { lineHeight: 24 },
  meter: { flexDirection: 'row', gap: 4, paddingTop: 4 },
  meterBar: { flex: 1, height: 4, borderRadius: radius.pill },
  terms: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xs, marginTop: spacing.xl },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.surfaceTintStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxOn: { backgroundColor: colors.primary },
  termsText: { flex: 1, fontFamily: fonts.regular, lineHeight: 18 },
  link: { fontFamily: fonts.semibold },
  error: { color: colors.danger, marginTop: spacing.xs, paddingHorizontal: spacing.xs },
  formError: { textAlign: 'center', marginTop: spacing.md },
  submit: { marginTop: spacing.xl },
  social: { marginTop: spacing.xl, gap: spacing.xl },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xl,
  },
});
