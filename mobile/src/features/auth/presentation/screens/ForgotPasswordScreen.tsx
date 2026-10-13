
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
    'ForgotPassword'
>;

export function ForgotPasswordScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    function handleRecovery() {
        setError('');

        if (!email.trim()) {
            setError('Informe seu e-mail cadastrado.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            setError('Digite um e-mail válido.');
            return;
        }

        // Simulação: nenhuma solicitação é enviada ao backend.
        Alert.alert(
            'Recuperação simulada',
            'O e-mail foi validado. Nesta versão de demonstração, nenhum link foi enviado.',
            [
                {
                    text: 'Entendi',
                    onPress: () => navigation.navigate('Login'),
                },
            ],
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
                            style={styles.backCircle}
                            onPress={() => navigation.goBack()}
                            accessibilityRole="button"
                            accessibilityLabel="Voltar"
                        >
                            <Text style={styles.backIcon}>‹</Text>
                        </Pressable>
                    </View>

                    {/* Apresentação */}
                    <View style={styles.introCard}>
                        <View style={styles.recoveryIcon}>
                            <Text style={styles.recoveryIconText}>↺</Text>
                        </View>

                        <Text style={styles.title}>
                            Recuperar acesso
                        </Text>

                        <Text style={styles.description}>
                            Digite seu e-mail cadastrado e enviaremos
                            um link seguro para redefinir sua senha.
                        </Text>
                    </View>

                    {/* Formulário */}
                    <View style={styles.formCard}>
                        <View style={styles.fieldHeading}>
                            <Text style={styles.fieldLabel}>
                                E-mail cadastrado
                            </Text>

                            <Text style={styles.fieldExample}>
                                exemplo@email.com
                            </Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.mailIcon}>✉</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="seu.email@provedor.com"
                                placeholderTextColor={colors.text.secondary}
                                value={email}
                                onChangeText={(value) => {
                                    setEmail(value);
                                    if (error) setError('');
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                                textContentType="emailAddress"
                                returnKeyType="send"
                                onSubmitEditing={handleRecovery}
                                accessibilityLabel="E-mail cadastrado"
                            />
                        </View>

                        {error ? (
                            <Text
                                style={styles.errorText}
                                accessibilityRole="alert"
                            >
                                {error}
                            </Text>
                        ) : null}

                        <Pressable
                            onPress={handleRecovery}
                            accessibilityRole="button"
                            style={({ pressed }) => [
                                styles.primaryButton,
                                pressed && styles.pressed,
                            ]}
                        >
                            <Text style={styles.sendIcon}>➤</Text>

                            <Text style={styles.primaryButtonText}>
                                Enviar link de recuperação
                            </Text>
                        </Pressable>
                    </View>

                    {/* Voltar ao Login */}
                    <Pressable
                        onPress={() => navigation.navigate('Login')}
                        accessibilityRole="button"
                        style={({ pressed }) => [
                            styles.backToLoginButton,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.backToLoginText}>
                            ← Voltar para o login
                        </Text>
                    </Pressable>
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
        backgroundColor: '#F7F8FF',
    },

    container: {
        flexGrow: 1,
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xxxl,
    },

    header: {
        height: 56,
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },

    backCircle: {
        width: 44,
        height: 44,
        borderRadius: radius.full,
        backgroundColor: colors.surface.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    backIcon: {
        fontSize: 32,
        lineHeight: 36,
        color: colors.text.primary,
    },

    introCard: {
        backgroundColor: colors.white,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xxl,
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },

    recoveryIcon: {
        width: 76,
        height: 76,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },

    recoveryIconText: {
        fontFamily: fontFamily.bold,
        fontSize: 44,
        lineHeight: 50,
        color: colors.white,
    },

    title: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xxl,
        lineHeight: 32,
        color: colors.text.primary,
        textAlign: 'center',
    },

    description: {
        ...typography.body,
        fontSize: fontSize.sm,
        lineHeight: 21,
        color: colors.text.secondary,
        textAlign: 'center',
    },

    formCard: {
        backgroundColor: colors.white,
        borderRadius: radius.lg,
        padding: spacing.xxl,
        gap: spacing.md,
    },

    fieldHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },

    fieldLabel: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    fieldExample: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    inputContainer: {
        minHeight: 52,
        backgroundColor: colors.surface.secondary,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },

    mailIcon: {
        color: colors.text.secondary,
        fontSize: fontSize.lg,
    },

    input: {
        flex: 1,
        minHeight: 48,
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    errorText: {
        ...typography.caption,
        color: colors.status.error,
    },

    primaryButton: {
        minHeight: 52,
        backgroundColor: colors.primary,
        borderRadius: radius.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.sm,
    },

    sendIcon: {
        color: colors.white,
        fontSize: fontSize.md,
    },

    primaryButtonText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.white,
        textAlign: 'center',
        flexShrink: 1,
    },

    backToLoginButton: {
        minHeight: 52,
        marginHorizontal: spacing.lg,
        marginTop: spacing.xxxl,
        backgroundColor: colors.white,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        justifyContent: 'center',
        alignItems: 'center',
    },

    backToLoginText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    pressed: {
        opacity: 0.8,
    },
});
