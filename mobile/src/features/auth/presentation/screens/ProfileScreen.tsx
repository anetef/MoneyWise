import { SafeAreaView } from 'react-native-safe-area-context';

import {
    ActivityIndicator,
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
    shadows,
    spacing,
} from '../../../../core/theme';

import { ConfirmDialog } from '../components/ConfirmDialog';
import { useProfile } from '../viewmodels/useProfile';

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

/**
 * Tela Meu Perfil (MAU-05, incorporando MST-01).
 *
 * Usa dados simulados e o logout simulado do MockAuthContext.
 * O logout completo (revogação no backend e limpeza local)
 * continua pendente do MAU-05.
 *
 * Plano Pro, Dados Pessoais e Notificações foram removidos
 * do menu pela decisão L-12 (parte 2, 18/10).
 */
export function ProfileScreen() {
    const {
        user,
        isLoading,
        isConfirmingSignOut,
        isSigningOut,
        signOutError,
        requestSignOut,
        cancelSignOut,
        confirmSignOut,
    } = useProfile();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* Cabeçalho */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Perfil</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                {isLoading || !user ? (
                    <ActivityIndicator color={colors.primary} />
                ) : (
                    <>
                        {/* Identificação do usuário */}
                        <View style={styles.identity}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {getInitials(user.name)}
                                </Text>
                            </View>

                            <Text style={styles.name}>{user.name}</Text>
                            <Text style={styles.email}>{user.email}</Text>
                        </View>

                        {/* Sair da conta */}
                        <Pressable
                            onPress={requestSignOut}
                            accessibilityRole="button"
                            style={({ pressed }) => [
                                styles.signOutButton,
                                pressed && styles.pressed,
                            ]}
                        >
                            <Text style={styles.signOutText}>⇥  Sair da Conta</Text>
                        </Pressable>
                    </>
                )}
            </ScrollView>

            <ConfirmDialog
                visible={isConfirmingSignOut}
                title="Sair da conta?"
                message={
                    signOutError
                    ?? 'Você precisará entrar novamente para acessar suas finanças.'
                }
                confirmLabel="Sair"
                destructive
                isConfirming={isSigningOut}
                onConfirm={confirmSignOut}
                onCancel={cancelSignOut}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },

    header: {
        backgroundColor: colors.surface.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        ...shadows.sm,
    },

    headerTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.primary,
    },

    container: {
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
        padding: spacing.xl,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.massive,
        gap: spacing.xxl,
    },

    pressed: {
        opacity: 0.85,
    },

    identity: {
        alignItems: 'center',
        gap: spacing.xs,
    },

    avatar: {
        width: 96,
        height: 96,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },

    avatarText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xxl,
        color: colors.text.inverse,
    },

    name: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.text.primary,
    },

    email: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.text.secondary,
    },

    signOutButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface.primary,
        borderRadius: radius.lg,
        paddingVertical: spacing.lg,
        marginTop: spacing.lg,
        ...shadows.sm,
    },

    signOutText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.status.error,
    },
});
