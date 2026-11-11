import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
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
import { useRegister } from '../viewmodels/useRegister';

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
    'Register'
>;

const INPUT_PLACEHOLDER = '#B7C9BE';
const INPUT_BORDER = '#E4ECFF';
const INPUT_BACKGROUND = '#FFFFFF';

export function RegisterScreen({ navigation }: Props) {
    const viewModel = useRegister({
        onRegistered: (email) => navigation.navigate('VerifyEmail', { email }),
    });

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

                    {/* Introdução */}
                    <View style={styles.intro}>
                        <Text style={styles.title}>
                            Criar sua conta
                        </Text>

                        <Text style={styles.description}>
                            Junte-se para organizar suas finanças pessoais e
                            planejar metas conjuntas com quem você confia.
                        </Text>
                    </View>

                    {/* Formulário */}
                    <View style={styles.form}>
                        {/* Nome */}
                        <View style={styles.inputField}>
                            <View style={styles.fieldHeader}>
                                <Text style={styles.fieldIcon}>♙</Text>
                                <Text style={styles.fieldLabel}>
                                    NOME COMPLETO
                                </Text>
                            </View>

                            <TextInput
                                style={styles.textInput}
                                value={viewModel.name}
                                onChangeText={viewModel.setName}
                                placeholder="Ex: Maria Silva"
                                placeholderTextColor={INPUT_PLACEHOLDER}
                                autoCapitalize="words"
                                autoComplete="name"
                                returnKeyType="next"
                                accessibilityLabel="Nome completo"
                            />
                        </View>

                        {/* E-mail */}
                        <View style={styles.inputField}>
                            <View style={styles.fieldHeader}>
                                <Text style={styles.fieldIcon}>✉</Text>
                                <Text style={styles.fieldLabel}>
                                    E-MAIL
                                </Text>
                            </View>

                            <TextInput
                                style={styles.textInput}
                                value={viewModel.email}
                                onChangeText={viewModel.setEmail}
                                placeholder="seuemail@exemplo.com"
                                placeholderTextColor={INPUT_PLACEHOLDER}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                                returnKeyType="next"
                                accessibilityLabel="E-mail"
                            />

                            {viewModel.emailError ? (
                                <Text style={styles.fieldErrorText} accessibilityRole="alert">
                                    {viewModel.emailError}
                                </Text>
                            ) : null}
                        </View>

                        {/* Senha */}
                        <View style={styles.inputField}>
                            <View style={styles.fieldHeader}>
                                <Text style={styles.fieldIcon}>♙</Text>
                                <Text style={styles.fieldLabel}>SENHA</Text>

                                <Text style={styles.passwordHint}>
                                    Mínimo 8 caracteres
                                </Text>
                            </View>

                            <View style={styles.passwordRow}>
                                <TextInput
                                    style={[styles.textInput, styles.passwordInput]}
                                    value={viewModel.password}
                                    onChangeText={viewModel.setPassword}
                                    placeholder="Digite uma senha forte"
                                    placeholderTextColor={INPUT_PLACEHOLDER}
                                    secureTextEntry={!viewModel.showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    autoComplete="new-password"
                                    accessibilityLabel="Senha"
                                />

                                <Pressable
                                    onPress={viewModel.toggleShowPassword}
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        viewModel.showPassword ? 'Ocultar senha' : 'Mostrar senha'
                                    }
                                    style={styles.eyeButton}
                                >
                                    <Text style={styles.eyeIcon}>
                                        {viewModel.showPassword ? '◉' : '◎'}
                                    </Text>
                                </Pressable>
                            </View>

                            {/* Indicador de força */}
                            <View style={styles.strengthRow}>
                                {[1, 2, 3, 4].map((level) => (
                                    <View
                                        key={level}
                                        style={[
                                            styles.strengthSegment,
                                            level <= viewModel.passwordStrength &&
                                            styles.strengthActive,
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Confirmação */}
                        <View style={styles.inputField}>
                            <View style={styles.fieldHeader}>
                                <Text style={styles.fieldIcon}>⊙</Text>
                                <Text style={styles.fieldLabel}>
                                    CONFIRMAR SENHA
                                </Text>
                            </View>

                            <View style={styles.passwordRow}>
                                <TextInput
                                    style={[styles.textInput, styles.passwordInput]}
                                    value={viewModel.confirmPassword}
                                    onChangeText={viewModel.setConfirmPassword}
                                    placeholder="Repita sua senha"
                                    placeholderTextColor={INPUT_PLACEHOLDER}
                                    secureTextEntry={!viewModel.showConfirmPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    autoComplete="new-password"
                                    accessibilityLabel="Confirmar senha"
                                />

                                <Pressable
                                    onPress={viewModel.toggleShowConfirmPassword}
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        viewModel.showConfirmPassword
                                            ? 'Ocultar confirmação de senha'
                                            : 'Mostrar confirmação de senha'
                                    }
                                    style={styles.eyeButton}
                                >
                                    <Text style={styles.eyeIcon}>
                                        {viewModel.showConfirmPassword ? '◉' : '◎'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* Termos */}
                    <View style={styles.termsRow}>
                        <Pressable
                            onPress={viewModel.toggleAcceptedTerms}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: viewModel.acceptedTerms }}
                            accessibilityLabel="Aceitar Termos de Uso e Política de Privacidade"
                            style={[
                                styles.checkbox,
                                viewModel.acceptedTerms && styles.checkboxChecked,
                            ]}
                        >
                            {viewModel.acceptedTerms && (
                                <Text style={styles.checkboxMark}>✓</Text>
                            )}
                        </Pressable>

                        <View style={styles.termsContent}>
                            <Text style={styles.termsText}>
                                Li e concordo com os{' '}
                                <Text
                                    style={styles.termsLink}
                                    onPress={() => navigation.navigate('Legal', { document: 'terms' })}
                                >
                                    Termos de Uso
                                </Text>
                                {' '}e a{' '}
                                <Text
                                    style={styles.termsLink}
                                    onPress={() =>
                                        navigation.navigate('Legal', { document: 'privacy' })
                                    }
                                >
                                    Política de Privacidade
                                </Text>
                                {' '}do MoneyWise.
                            </Text>
                        </View>
                    </View>

                    {/* Mensagem de validação */}
                    {viewModel.error ? (
                        <Text
                            style={styles.errorText}
                            accessibilityRole="alert"
                        >
                            {viewModel.error}
                        </Text>
                    ) : null}

                    {/* Cadastro */}
                    <Pressable
                        onPress={viewModel.submit}
                        disabled={viewModel.isLoading}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: viewModel.isLoading, busy: viewModel.isLoading }}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            (pressed || viewModel.isLoading) && styles.pressed,
                        ]}
                    >
                        <Text style={styles.primaryButtonText}>
                            {viewModel.isLoading ? 'Criando conta...' : 'Criar conta gratuita →'}
                        </Text>
                    </Pressable>

                    {/* Link para Login */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Já tem uma conta?{' '}
                        </Text>

                        <Pressable
                            onPress={() => navigation.navigate('Login')}
                            accessibilityRole="button"
                        >
                            <Text style={styles.loginLink}>Entrar</Text>
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
        marginTop: spacing.xxxl,
        marginBottom: spacing.xxl,
        gap: spacing.xs,
    },

    title: {
        fontFamily: fontFamily.bold,
        fontSize: 30,
        lineHeight: 38,
        letterSpacing: -0.8,
        color: colors.text.primary,
    },

    description: {
        ...typography.body,
        color: colors.text.secondary,
        lineHeight: 24,
    },

    form: {
        backgroundColor: INPUT_BACKGROUND,
        borderRadius: radius.lg,
        overflow: 'hidden',
        marginBottom: spacing.xxl,
    },

    inputField: {
        minHeight: 85,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: INPUT_BORDER,
        justifyContent: 'center',
        gap: spacing.sm,
    },

    fieldHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },

    fieldIcon: {
        color: colors.primary,
        fontSize: fontSize.sm,
    },

    fieldLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        letterSpacing: 0.5,
        color: colors.text.secondary,
    },

    textInput: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.text.primary,
        paddingVertical: spacing.xs,
        minHeight: 35,
    },

    passwordHint: {
        marginLeft: 'auto',
        fontFamily: fontFamily.medium,
        fontSize: 11,
        color: colors.text.secondary,
    },

    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    passwordInput: {
        flex: 1,
    },

    eyeButton: {
        padding: spacing.sm,
    },

    eyeIcon: {
        color: colors.text.secondary,
        fontSize: 23,
    },

    strengthRow: {
        flexDirection: 'row',
        gap: spacing.xs,
    },

    strengthSegment: {
        flex: 1,
        height: 4,
        borderRadius: radius.full,
        backgroundColor: '#E0EAFF',
    },

    strengthActive: {
        backgroundColor: colors.primary,
    },

    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        marginBottom: spacing.xxl,
    },

    checkbox: {
        width: 20,
        height: 20,
        borderRadius: radius.xs,
        backgroundColor: '#DEE8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },

    checkboxChecked: {
        backgroundColor: colors.primary,
    },

    checkboxMark: {
        color: colors.white,
        fontFamily: fontFamily.bold,
        fontSize: fontSize.sm,
    },

    termsContent: {
        flex: 1,
    },

    termsText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        lineHeight: 20,
        color: colors.text.secondary,
    },

    termsLink: {
        fontFamily: fontFamily.semiBold,
        color: colors.primary,
    },

    errorText: {
        ...typography.caption,
        color: colors.status.error,
        marginBottom: spacing.md,
    },

    fieldErrorText: {
        ...typography.caption,
        color: colors.status.error,
    },

    primaryButton: {
        minHeight: 54,
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },

    primaryButtonText: {
        ...typography.button,
        color: colors.white,
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

    loginLink: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.primary,
    },

    pressed: {
        opacity: 0.8,
    },
});