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
import { useResetPassword } from '../viewmodels/useResetPassword';

import {
    colors,
    radius,
    spacing,
} from '../../../../core/theme';

type Props = NativeStackScreenProps<
    AuthStackParamList,
    'ResetPassword'
>;

/**
 * Redefinir Senha (MAU-08), passo 3 de 3.
 *
 * Mesmas regras de senha do cadastro. Depois da troca, volta
 * para "Entrar na conta" com o aviso de senha alterada.
 */
export function ResetPasswordScreen({ navigation, route }: Props) {
    const { email, code } = route.params;

    const viewModel = useResetPassword({
        email,
        code,
        // Volta ao login já aberto: o voltar não reabre a recuperação.
        onPasswordChanged: () => navigation.popTo('Login', { passwordChanged: true, email }),
    });

    return (
        <PasswordRecoveryLayout
            step={3}
            icon="•••"
            title="Redefinir senha"
            description="Crie uma senha nova para entrar no MoneyWise."
            onBack={() => navigation.goBack()}
        >
            {/* Nova senha */}
            <View style={recoveryStyles.fieldHeading}>
                <Text style={recoveryStyles.fieldLabel}>Nova senha</Text>

                <Text style={recoveryStyles.fieldHint}>
                    Mínimo 8 caracteres
                </Text>
            </View>

            <View style={recoveryStyles.inputContainer}>
                <TextInput
                    style={recoveryStyles.input}
                    value={viewModel.password}
                    onChangeText={viewModel.setPassword}
                    placeholder="Digite uma senha forte"
                    placeholderTextColor={colors.text.secondary}
                    secureTextEntry={!viewModel.showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    accessibilityLabel="Nova senha"
                    autoFocus
                />

                <Pressable
                    onPress={viewModel.toggleShowPassword}
                    accessibilityRole="button"
                    accessibilityLabel={
                        viewModel.showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                    style={recoveryStyles.eyeButton}
                >
                    <Text style={recoveryStyles.eyeIcon}>
                        {viewModel.showPassword ? '◉' : '◎'}
                    </Text>
                </Pressable>
            </View>

            {/* Indicador de força, igual ao do cadastro */}
            <View style={styles.strengthRow}>
                {[1, 2, 3, 4].map((level) => (
                    <View
                        key={level}
                        style={[
                            styles.strengthSegment,
                            level <= viewModel.passwordStrength && styles.strengthActive,
                        ]}
                    />
                ))}
            </View>

            {/* Confirmação */}
            <Text style={[recoveryStyles.fieldLabel, styles.confirmLabel]}>
                Confirmar nova senha
            </Text>

            <View style={recoveryStyles.inputContainer}>
                <TextInput
                    style={recoveryStyles.input}
                    value={viewModel.confirmPassword}
                    onChangeText={viewModel.setConfirmPassword}
                    placeholder="Repita a nova senha"
                    placeholderTextColor={colors.text.secondary}
                    secureTextEntry={!viewModel.showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="done"
                    onSubmitEditing={viewModel.submit}
                    accessibilityLabel="Confirmar nova senha"
                />

                <Pressable
                    onPress={viewModel.toggleShowConfirmPassword}
                    accessibilityRole="button"
                    accessibilityLabel={
                        viewModel.showConfirmPassword
                            ? 'Ocultar confirmação de senha'
                            : 'Mostrar confirmação de senha'
                    }
                    style={recoveryStyles.eyeButton}
                >
                    <Text style={recoveryStyles.eyeIcon}>
                        {viewModel.showConfirmPassword ? '◉' : '◎'}
                    </Text>
                </Pressable>
            </View>

            {viewModel.error ? (
                <Text style={recoveryStyles.errorText} accessibilityRole="alert">
                    {viewModel.error}
                </Text>
            ) : null}

            {viewModel.codeExpired ? (
                // O código venceu: volta para pedir outro.
                <Pressable
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                        recoveryStyles.primaryButton,
                        pressed && recoveryStyles.pressed,
                    ]}
                >
                    <Text style={recoveryStyles.primaryButtonText}>
                        ← Pedir novo código
                    </Text>
                </Pressable>
            ) : (
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
                        {viewModel.isLoading ? 'Salvando...' : 'Salvar nova senha'}
                    </Text>
                </Pressable>
            )}
        </PasswordRecoveryLayout>
    );
}

const styles = StyleSheet.create({
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

    confirmLabel: {
        marginTop: spacing.xs,
    },
});
