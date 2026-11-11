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
import { useForgotPassword } from '../viewmodels/useForgotPassword';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
} from '../../../../core/theme';

type Props = NativeStackScreenProps<
    AuthStackParamList,
    'ForgotPassword'
>;

/**
 * Recuperar Senha (MAU-07, MAU-08), passo 1 de 3.
 *
 * Pede o código por e-mail (SEC-09) e segue para "Verificar código".
 */
export function ForgotPasswordScreen({ navigation, route }: Props) {
    const viewModel = useForgotPassword({
        initialEmail: route.params?.email,
        onCodeSent: (email) => navigation.navigate('ResetCode', { email }),
    });

    return (
        <PasswordRecoveryLayout
            step={1}
            icon="↺"
            title="Recuperar acesso"
            description="Insira seu e-mail e enviaremos um código para você."
            onBack={() => navigation.goBack()}
            footer={
                <Pressable
                    onPress={() => navigation.navigate('Login')}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                        styles.backToLoginButton,
                        pressed && recoveryStyles.pressed,
                    ]}
                >
                    <Text style={styles.backToLoginText}>
                        ← Voltar para o login
                    </Text>
                </Pressable>
            }
        >
            <View style={recoveryStyles.fieldHeading}>
                <Text style={recoveryStyles.fieldLabel}>
                    E-mail cadastrado
                </Text>

                <Text style={recoveryStyles.fieldHint}>
                    exemplo@email.com
                </Text>
            </View>

            <View style={recoveryStyles.inputContainer}>
                <Text style={recoveryStyles.inputIcon}>✉</Text>

                <TextInput
                    style={recoveryStyles.input}
                    value={viewModel.email}
                    onChangeText={viewModel.setEmail}
                    placeholder="seu.email@provedor.com"
                    placeholderTextColor={colors.text.secondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    returnKeyType="send"
                    onSubmitEditing={viewModel.submit}
                    accessibilityLabel="E-mail cadastrado"
                />
            </View>

            {viewModel.error ? (
                <Text style={recoveryStyles.errorText} accessibilityRole="alert">
                    {viewModel.error}
                </Text>
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
                <Text style={recoveryStyles.buttonIcon}>➤</Text>

                <Text style={recoveryStyles.primaryButtonText}>
                    {viewModel.isLoading ? 'Enviando...' : 'Enviar código'}
                </Text>
            </Pressable>
        </PasswordRecoveryLayout>
    );
}

const styles = StyleSheet.create({
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
});
