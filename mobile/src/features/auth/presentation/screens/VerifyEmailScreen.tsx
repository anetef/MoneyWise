import { useEffect, useState } from 'react';
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
import { useMockAuth } from '../../../../core/navigation/MockAuthContext';
import { ApiError } from '../../../../core/api/apiClient';
import { authRepository } from '../../data/ApiAuthRepository';

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
    'VerifyEmail'
>;

const CODE_LENGTH = 6;
// A API só aceita um novo envio depois de 1 minuto.
const RESEND_COOLDOWN_SECONDS = 60;

const INPUT_PLACEHOLDER = '#B7C9BE';
const INPUT_BORDER = '#E4ECFF';

export function VerifyEmailScreen({ navigation, route }: Props) {
    const { signIn } = useMockAuth();
    const { email } = route.params;

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

    // Contagem regressiva do botão "Reenviar código".
    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }

        const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    function handleChangeCode(text: string) {
        // Aceita só números, no máximo 6.
        setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH));
    }

    async function handleVerify() {
        if (isLoading) {
            return;
        }

        setError('');
        setInfo('');

        if (code.length !== CODE_LENGTH) {
            setError('Digite o código de 6 dígitos.');
            return;
        }

        setIsLoading(true);

        try {
            // Se der certo, a sessão já fica salva e o usuário entra no app.
            await authRepository.verifyEmail(email, code);
            signIn();
        } catch (e) {
            if (e instanceof ApiError && e.code === 'INVALID_VERIFICATION_CODE') {
                setError('Código incorreto. Confira e tente de novo.');
            } else if (e instanceof ApiError && e.code === 'VERIFICATION_CODE_EXPIRED') {
                setError('Este código expirou. Peça um novo código.');
            } else if (e instanceof ApiError && e.code === 'VERIFICATION_ATTEMPTS_EXCEEDED') {
                setError('Muitas tentativas erradas. Peça um novo código.');
            } else if (e instanceof ApiError && e.code === 'EMAIL_ALREADY_VERIFIED') {
                setError('Este e-mail já foi confirmado. Entre com sua senha.');
            } else if (e instanceof ApiError && e.code === 'NETWORK_ERROR') {
                setError('Sem conexão com o servidor. Tente de novo.');
            } else {
                setError('Não foi possível confirmar o código. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function handleResend() {
        if (isResending || cooldown > 0) {
            return;
        }

        setError('');
        setInfo('');
        setIsResending(true);

        try {
            await authRepository.resendVerificationCode(email);
            setCode('');
            setInfo('Enviamos um novo código para o seu e-mail.');
            setCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (e) {
            if (e instanceof ApiError && e.code === 'VERIFICATION_RESEND_TOO_SOON') {
                setError('Aguarde um minuto antes de pedir outro código.');
                setCooldown(RESEND_COOLDOWN_SECONDS);
            } else if (e instanceof ApiError && e.code === 'NETWORK_ERROR') {
                setError('Sem conexão com o servidor. Tente de novo.');
            } else {
                setError('Não foi possível reenviar o código. Tente novamente.');
            }
        } finally {
            setIsResending(false);
        }
    }

    const canResend = cooldown <= 0 && !isResending;

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
                            Confirme seu e-mail
                        </Text>

                        <Text style={styles.description}>
                            Enviamos um código de 6 dígitos para{' '}
                            <Text style={styles.emailHighlight}>{email}</Text>.
                            Ele vale por 15 minutos.
                        </Text>
                    </View>

                    {/* Código */}
                    <View style={styles.form}>
                        <View style={styles.inputField}>
                            <View style={styles.fieldHeader}>
                                <Text style={styles.fieldIcon}>✉</Text>
                                <Text style={styles.fieldLabel}>
                                    CÓDIGO DE CONFIRMAÇÃO
                                </Text>
                            </View>

                            <TextInput
                                style={[styles.textInput, styles.codeInput]}
                                value={code}
                                onChangeText={handleChangeCode}
                                placeholder="000000"
                                placeholderTextColor={INPUT_PLACEHOLDER}
                                keyboardType="number-pad"
                                maxLength={CODE_LENGTH}
                                autoComplete="one-time-code"
                                textContentType="oneTimeCode"
                                returnKeyType="done"
                                onSubmitEditing={handleVerify}
                                accessibilityLabel="Código de confirmação"
                                autoFocus
                            />
                        </View>
                    </View>

                    {/* Mensagens */}
                    {error ? (
                        <Text
                            style={styles.errorText}
                            accessibilityRole="alert"
                        >
                            {error}
                        </Text>
                    ) : null}

                    {info ? (
                        <Text style={styles.infoText}>{info}</Text>
                    ) : null}

                    {/* Confirmar */}
                    <Pressable
                        onPress={handleVerify}
                        disabled={isLoading}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: isLoading, busy: isLoading }}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            (pressed || isLoading) && styles.pressed,
                        ]}
                    >
                        <Text style={styles.primaryButtonText}>
                            {isLoading ? 'Confirmando...' : 'Confirmar e entrar →'}
                        </Text>
                    </Pressable>

                    {/* Reenviar */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Não recebeu o código?{' '}
                        </Text>

                        <Pressable
                            onPress={handleResend}
                            disabled={!canResend}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: !canResend }}
                        >
                            <Text
                                style={[
                                    styles.resendLink,
                                    !canResend && styles.resendDisabled,
                                ]}
                            >
                                {isResending
                                    ? 'Enviando...'
                                    : cooldown > 0
                                        ? `Reenviar em ${cooldown}s`
                                        : 'Reenviar código'}
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

    emailHighlight: {
        fontFamily: fontFamily.semiBold,
        color: colors.text.primary,
    },

    form: {
        backgroundColor: colors.white,
        borderRadius: radius.lg,
        overflow: 'hidden',
        marginBottom: spacing.xl,
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

    codeInput: {
        fontFamily: fontFamily.semiBold,
        fontSize: 24,
        letterSpacing: 8,
    },

    errorText: {
        ...typography.caption,
        color: colors.status.error,
        marginBottom: spacing.md,
    },

    infoText: {
        ...typography.caption,
        color: colors.primary,
        marginBottom: spacing.md,
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
        marginTop: spacing.xl,
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

    resendLink: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.primary,
    },

    resendDisabled: {
        color: colors.text.secondary,
    },

    pressed: {
        opacity: 0.8,
    },
});
