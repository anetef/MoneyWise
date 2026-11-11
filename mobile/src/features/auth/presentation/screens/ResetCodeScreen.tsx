import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import type { AuthStackParamList } from '../../../../core/navigation/types';
import { PasswordRecoveryLayout, recoveryStyles } from '../components/PasswordRecoveryLayout';
import { useResetCode } from '../viewmodels/useResetCode';

import {
    colors,
    fontFamily,
    fontSize,
    spacing,
} from '../../../../core/theme';

type Props = NativeStackScreenProps<
    AuthStackParamList,
    'ResetCode'
>;

/**
 * Verificar Código (MAU-08), passo 2 de 3.
 *
 * O texto não diz se o e-mail tem conta (SEC-09).
 */
export function ResetCodeScreen({ navigation, route }: Props) {
    const { email } = route.params;

    const viewModel = useResetCode({
        email,
        onVerified: (code) => navigation.navigate('ResetPassword', { email, code }),
    });

    return (
        <PasswordRecoveryLayout
            step={2}
            icon="✉"
            title="Verificar código"
            description={
                <>
                    Se o e-mail estiver cadastrado, você vai receber um
                    código de 6 dígitos em{' '}
                    <Text style={styles.emailHighlight}>{email}</Text>.
                    Ele vale por 15 minutos.
                </>
            }
            onBack={() => navigation.goBack()}
        >
            <Text style={recoveryStyles.fieldLabel}>
                Código de verificação
            </Text>

            <View style={recoveryStyles.inputContainer}>
                <TextInput
                    style={[recoveryStyles.input, styles.codeInput]}
                    value={viewModel.code}
                    onChangeText={viewModel.setCode}
                    placeholder="000000"
                    placeholderTextColor="#B7C9BE"
                    keyboardType="number-pad"
                    maxLength={viewModel.codeLength}
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                    returnKeyType="done"
                    onSubmitEditing={viewModel.submit}
                    accessibilityLabel="Código de verificação"
                    autoFocus
                />
            </View>

            {viewModel.error ? (
                <Text style={recoveryStyles.errorText} accessibilityRole="alert">
                    {viewModel.error}
                </Text>
            ) : null}

            {viewModel.info ? (
                <Text style={recoveryStyles.infoText}>{viewModel.info}</Text>
            ) : null}

            <Pressable
                onPress={viewModel.submit}
                disabled={viewModel.isLoading}
                accessibilityRole="button"
                accessibilityState={{ disabled: viewModel.isLoading, busy: viewModel.isLoading }}
                style={({ pressed }) => [
                    recoveryStyles.primaryButton,
                    pressed && recoveryStyles.pressed,
                    viewModel.isLoading && recoveryStyles.busy,
                ]}
            >
                <Text style={recoveryStyles.primaryButtonText}>
                    {viewModel.isLoading ? 'Conferindo...' : 'Continuar →'}
                </Text>
            </Pressable>

            {/* Reenviar */}
            <View style={styles.resendRow}>
                <Text style={styles.resendText}>
                    Não recebeu o código?{' '}
                </Text>

                <Pressable
                    onPress={viewModel.resend}
                    disabled={!viewModel.canResend}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !viewModel.canResend }}
                    hitSlop={spacing.sm}
                >
                    <Text
                        style={[
                            styles.resendLink,
                            !viewModel.canResend && styles.resendDisabled,
                        ]}
                    >
                        {viewModel.isResending
                            ? 'Enviando...'
                            : viewModel.cooldown > 0
                                ? `Reenviar em ${viewModel.cooldown}s`
                                : 'Reenviar código'}
                    </Text>
                </Pressable>
            </View>
        </PasswordRecoveryLayout>
    );
}

const styles = StyleSheet.create({
    emailHighlight: {
        fontFamily: fontFamily.semiBold,
        color: colors.text.primary,
    },

    codeInput: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xxl,
        letterSpacing: 8,
        textAlign: 'center',
    },

    resendRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: spacing.xs,
    },

    resendText: {
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
});
