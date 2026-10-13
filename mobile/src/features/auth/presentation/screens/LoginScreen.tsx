import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import type { AuthStackParamList } from '../../../../core/navigation/types';
import { useMockAuth } from '../../../../core/navigation/MockAuthContext';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
    typography,
} from '../../../../core/theme';

type Props = NativeStackScreenProps<
    AuthStackParamList,
    'Login'
>;

export function LoginScreen({ navigation }: Props) {
    const { signIn } = useMockAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');

    function handleLogin() {
        setError('');

        if (!email.trim() || !password) {
            setError('Preencha seu e-mail e sua senha.');
            return;
        }

        // Validação temporária para o login mockado.
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            setError('Digite um e-mail válido.');
            return;
        }

        if (password.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres.');
            return;
        }

        // Autenticação simulada.
        // Não envia ou armazena credenciais.
        signIn();
    }

    function handleSocialLogin(provider: string) {
        Alert.alert(
            'Em desenvolvimento',
            `O login com ${provider} estará disponível futuramente.`,
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Cabeçalho */}
                    <View style={styles.header}>
                        <Pressable
                            onPress={() => navigation.goBack()}
                            accessibilityRole="button"
                            accessibilityLabel="Voltar"
                            style={styles.backButton}
                        >
                            <Text style={styles.backIcon}>‹</Text>
                        </Pressable>
                    </View>

                    {/* Apresentação */}
                    <View style={styles.intro}>
                        <View style={styles.logo}>
                            <Text style={styles.logoIcon}>▣</Text>
                        </View>

                        <Text style={styles.title}>
                            Bem-vindo de volta
                        </Text>

                        <Text style={styles.description}>
                            Acesse sua conta para gerenciar seus
                            {'\n'}gastos e caixinhas.
                        </Text>
                    </View>

                    {/* Formulário */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <View style={styles.inputRow}>
                                <Text style={styles.inputIcon}>@</Text>

                                <View style={styles.inputContent}>
                                    <Text style={styles.inputLabel}>
                                        E-MAIL OU TELEFONE
                                    </Text>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="seuemail@exemplo.com"
                                        placeholderTextColor={colors.text.secondary}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        autoComplete="email"
                                        returnKeyType="next"
                                        accessibilityLabel="E-mail"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputDivider} />

                            <View style={styles.inputRow}>
                                <Text style={styles.inputIcon}>♙</Text>

                                <View style={styles.inputContent}>
                                    <Text style={styles.inputLabel}>
                                        SENHA
                                    </Text>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Digite sua senha"
                                        placeholderTextColor={colors.text.secondary}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        autoComplete="current-password"
                                        accessibilityLabel="Senha"
                                    />
                                </View>

                                <Pressable
                                    onPress={() => setShowPassword(!showPassword)}
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        showPassword ? 'Ocultar senha' : 'Mostrar senha'
                                    }
                                    style={styles.eyeButton}
                                >
                                    <Text style={styles.eyeIcon}>
                                        {showPassword ? '◉' : '◎'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Opções */}
                        <View style={styles.optionsRow}>
                            <Pressable
                                onPress={() => setRememberMe(!rememberMe)}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: rememberMe }}
                                style={styles.rememberRow}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        rememberMe && styles.checkboxChecked,
                                    ]}
                                >
                                    {rememberMe && (
                                        <Text style={styles.checkboxMark}>✓</Text>
                                    )}
                                </View>

                                <Text style={styles.rememberText}>
                                    Lembrar de mim
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => navigation.navigate('ForgotPassword')}
                                accessibilityRole="button"
                            >
                                <Text style={styles.forgotText}>
                                    Esqueci minha senha
                                </Text>
                            </Pressable>
                        </View>

                        {error ? (
                            <Text style={styles.errorText} accessibilityRole="alert">
                                {error}
                            </Text>
                        ) : null}

                        {/* Login */}
                        <Pressable
                            onPress={handleLogin}
                            accessibilityRole="button"
                            style={({ pressed }) => [
                                styles.primaryButton,
                                pressed && styles.pressed,
                            ]}
                        >
                            <Text style={styles.primaryButtonText}>
                                Entrar na conta →
                            </Text>
                        </Pressable>
                    </View>

                    {/* Login social */}
                    <View style={styles.socialSection}>
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>
                                OU CONTINUE COM
                            </Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.socialRow}>
                            <Pressable
                                style={styles.socialButton}
                                onPress={() => handleSocialLogin('Apple')}
                                accessibilityRole="button"
                            >
                                <Text style={styles.appleIcon}>●</Text>
                                <Text style={styles.socialText}>Apple</Text>
                            </Pressable>

                            <Pressable
                                style={styles.socialButton}
                                onPress={() => handleSocialLogin('Google')}
                                accessibilityRole="button"
                            >
                                <Text style={styles.googleIcon}>G</Text>
                                <Text style={styles.socialText}>Google</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Cadastro */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Ainda não tem conta?{' '}
                        </Text>

                        <Pressable
                            onPress={() => navigation.navigate('Register')}
                            accessibilityRole="button"
                        >
                            <Text style={styles.registerLink}>
                                Criar nova conta
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },

    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },

    container: {
        flexGrow: 1,
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxxl,
    },

    header: {
        height: 64,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border.subtle,
        marginHorizontal: -spacing.lg,
        paddingHorizontal: spacing.lg,
    },

    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
    },

    backIcon: {
        fontSize: 38,
        lineHeight: 42,
        color: colors.text.primary,
    },

    intro: {
        alignItems: 'center',
        paddingTop: spacing.xxxl,
        paddingBottom: spacing.xxxl,
        gap: spacing.md,
    },

    logo: {
        width: 56,
        height: 56,
        borderRadius: radius.lg,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },

    logoIcon: {
        color: colors.white,
        fontSize: 30,
    },

    title: {
        fontFamily: fontFamily.bold,
        fontSize: 27,
        lineHeight: 36,
        color: colors.text.primary,
        letterSpacing: -0.6,
        textAlign: 'center',
    },

    description: {
        ...typography.body,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },

    form: {
        gap: spacing.xl,
    },

    inputGroup: {
        backgroundColor: '#F2F5FF',
        borderRadius: radius.lg,
        overflow: 'hidden',
    },

    inputRow: {
        minHeight: 82,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },

    inputIcon: {
        width: 22,
        fontSize: fontSize.lg,
        color: colors.text.secondary,
        textAlign: 'center',
    },

    inputContent: {
        flex: 1,
        justifyContent: 'center',
    },

    inputLabel: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        letterSpacing: 0.7,
    },

    input: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.text.primary,
        paddingVertical: spacing.xs,
        minHeight: 36,
    },

    inputDivider: {
        height: 1,
        backgroundColor: colors.white,
        marginLeft: 50,
    },

    eyeButton: {
        padding: spacing.sm,
    },

    eyeIcon: {
        fontSize: 23,
        color: colors.text.secondary,
    },

    optionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },

    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    checkbox: {
        width: 20,
        height: 20,
        borderRadius: radius.sm,
        backgroundColor: '#DCE8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },

    checkboxChecked: {
        backgroundColor: colors.primary,
    },

    checkboxMark: {
        color: colors.white,
        fontFamily: fontFamily.bold,
        fontSize: fontSize.sm,
    },

    rememberText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    forgotText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.primary,
    },

    errorText: {
        ...typography.caption,
        color: colors.status.error,
    },

    primaryButton: {
        minHeight: 54,
        borderRadius: radius.md,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },

    primaryButtonText: {
        ...typography.button,
        color: colors.white,
    },

    socialSection: {
        marginTop: spacing.xxxl,
        gap: spacing.xxl,
    },

    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },

    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#DCE6FF',
    },

    dividerText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    socialRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },

    socialButton: {
        flex: 1,
        minHeight: 52,
        backgroundColor: colors.white,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },

    socialText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    appleIcon: {
        fontSize: 19,
        color: colors.text.primary,
    },

    googleIcon: {
        fontFamily: fontFamily.bold,
        fontSize: 20,
        color: '#4285F4',
    },

    footer: {
        marginTop: 'auto',
        paddingTop: spacing.massive,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
    },

    footerText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },

    registerLink: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.primary,
    },

    pressed: {
        opacity: 0.8,
    },
});