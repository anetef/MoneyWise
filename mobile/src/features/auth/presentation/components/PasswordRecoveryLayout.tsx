import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
    typography,
} from '../../../../core/theme';

const TOTAL_STEPS = 3;

type Props = {
    /** Passo do fluxo: 1 e-mail, 2 código, 3 nova senha. */
    step: 1 | 2 | 3;
    icon: string;
    title: string;
    description: ReactNode;
    onBack: () => void;
    /** Conteúdo do cartão do formulário. */
    children: ReactNode;
    /** Conteúdo abaixo do cartão (ex.: voltar para o login). */
    footer?: ReactNode;
};

/**
 * Moldura das telas de recuperação de senha (MAU-07, MAU-08):
 * Recuperar Senha → Verificar Código → Redefinir Senha.
 *
 * Segue o visual da tela "Recuperar Senha" do Figma: voltar
 * redondo, cartão de apresentação com ícone e cartão do formulário.
 */
export function PasswordRecoveryLayout({
    step,
    icon,
    title,
    description,
    onBack,
    children,
    footer,
}: Props) {
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
                            onPress={onBack}
                            accessibilityRole="button"
                            accessibilityLabel="Voltar"
                        >
                            <Text style={styles.backIcon}>‹</Text>
                        </Pressable>

                        <View
                            style={styles.steps}
                            accessible
                            accessibilityLabel={`Passo ${step} de ${TOTAL_STEPS}`}
                        >
                            {Array.from({ length: TOTAL_STEPS }, (_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.stepBar,
                                        index < step && styles.stepBarDone,
                                    ]}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Apresentação */}
                    <View style={styles.introCard}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconText}>{icon}</Text>
                        </View>

                        <Text style={styles.title} accessibilityRole="header">
                            {title}
                        </Text>

                        <Text style={styles.description}>{description}</Text>
                    </View>

                    {/* Formulário */}
                    <View style={styles.formCard}>{children}</View>

                    {footer}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/** Estilos dos campos, mensagens e botões dentro do cartão do formulário. */
export const recoveryStyles = StyleSheet.create({
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

    fieldHint: {
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

    inputIcon: {
        color: colors.text.secondary,
        fontSize: fontSize.lg,
    },

    input: {
        flex: 1,
        // Deixa o campo encolher em telas estreitas (320 px).
        minWidth: 0,
        minHeight: 48,
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    eyeButton: {
        minWidth: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    eyeIcon: {
        color: colors.text.secondary,
        fontSize: 23,
    },

    errorText: {
        ...typography.caption,
        color: colors.status.error,
    },

    infoText: {
        ...typography.caption,
        color: colors.status.success,
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

    primaryButtonText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.white,
        textAlign: 'center',
        flexShrink: 1,
    },

    buttonIcon: {
        color: colors.white,
        fontSize: fontSize.md,
    },

    busy: {
        opacity: 0.7,
    },

    pressed: {
        opacity: 0.8,
    },
});

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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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

    steps: {
        flexDirection: 'row',
        gap: spacing.xs,
    },

    stepBar: {
        width: 24,
        height: 6,
        borderRadius: radius.full,
        backgroundColor: '#E0EAFF',
    },

    stepBarDone: {
        backgroundColor: colors.primary,
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

    iconCircle: {
        width: 76,
        height: 76,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },

    iconText: {
        fontFamily: fontFamily.bold,
        fontSize: 40,
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
});
