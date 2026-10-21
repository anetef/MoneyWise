
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

/**
 * Recuperar Senha (MAU-07).
 *
 * A recuperação está fora do MVP (L-03): não há endpoint nem
 * envio de e-mail. A tela mantém o visual do Figma, com o campo
 * e o botão desativados, e não simula nenhum envio.
 */
export function ForgotPasswordScreen({ navigation }: Props) {
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
                            A recuperação de senha ainda não está
                            disponível nesta versão do MoneyWise.
                        </Text>
                    </View>

                    {/* Formulário desativado até a recuperação existir (L-03) */}
                    <View style={styles.formCard}>
                        <View style={styles.fieldHeading}>
                            <Text style={styles.fieldLabel}>
                                E-mail cadastrado
                            </Text>

                            <Text style={styles.fieldExample}>
                                exemplo@email.com
                            </Text>
                        </View>

                        <View style={[styles.inputContainer, styles.disabled]}>
                            <Text style={styles.mailIcon}>✉</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="seu.email@provedor.com"
                                placeholderTextColor={colors.text.secondary}
                                editable={false}
                                accessibilityLabel="E-mail cadastrado, indisponível"
                                accessibilityState={{ disabled: true }}
                            />
                        </View>

                        <Pressable
                            disabled
                            accessibilityRole="button"
                            accessibilityLabel="Enviar link de recuperação, em breve"
                            accessibilityState={{ disabled: true }}
                            style={[styles.primaryButton, styles.disabled]}
                        >
                            <Text style={styles.sendIcon}>➤</Text>

                            <Text style={styles.primaryButtonText}>
                                Enviar link de recuperação
                            </Text>

                            <View style={styles.soonBadge}>
                                <Text style={styles.soonBadgeText}>Em breve</Text>
                            </View>
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

    disabled: {
        opacity: 0.55,
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

    soonBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
    },

    soonBadgeText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.white,
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
