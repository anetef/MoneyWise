import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import type { MainStackParamList } from '../../../../core/navigation/types';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    shadows,
    spacing,
    typography,
} from '../../../../core/theme';

import { DetailsHeader } from '../components/DetailsHeader';
import { EmptyState } from '../components/EmptyState';
import { useInviteMembers } from '../viewmodels/useInviteMembers';

type Props = NativeStackScreenProps<MainStackParamList, 'InviteMembers'>;

/**
 * Convidar Membros (MGO-07).
 *
 * Segue a decisão L-05: código de convite compartilhado como
 * link, WhatsApp ou QR Code. E-mail e "Sugestões de Contatos"
 * ficam fora do MVP. Nenhum convite é enviado de verdade.
 */
export function InviteMembersScreen({ navigation, route }: Props) {
    const {
        invitation,
        goalName,
        expiresInDays,
        isLoading,
        isCopied,
        load,
        markAsCopied,
    } = useInviteMembers(route.params.groupId);

    useEffect(() => {
        load();
    }, [load]);

    function handleCopy() {
        markAsCopied();
        Alert.alert(
            'Link copiado',
            'Simulação: nesta versão o link não é copiado para a área de transferência.',
        );
    }

    function handleWhatsApp() {
        Alert.alert(
            'WhatsApp',
            'Simulação: o envio do convite pelo WhatsApp estará disponível em breve.',
        );
    }

    function handleQrCode() {
        Alert.alert(
            'QR Code',
            'Simulação: a exibição do QR Code do convite estará disponível em breve.',
        );
    }

    function renderContent() {
        if (isLoading) {
            return <ActivityIndicator color={colors.primary} />;
        }

        if (!invitation) {
            return (
                <EmptyState
                    title="Convite indisponível"
                    description="Não foi possível gerar o convite. Volte e tente novamente."
                />
            );
        }

        return (
            <>
                <View style={styles.intro}>
                    <Text style={styles.introText}>
                        Compartilhe sua caixinha e gerencie finanças em conjunto.
                    </Text>

                    {goalName && (
                        <Text style={styles.goalName}>Caixinha: {goalName}</Text>
                    )}
                </View>

                {/* Link de convite */}
                <View style={styles.linkCard}>
                    <Text style={styles.linkTitle}>🔗  Link de Convite</Text>

                    <Text style={styles.linkDescription}>
                        Quem receber o convite poderá ver a caixinha e
                        precisará aceitar para participar.
                    </Text>

                    <View style={styles.linkField}>
                        <Text
                            style={styles.linkText}
                            numberOfLines={1}
                            selectable
                            accessibilityLabel={`Link de convite: ${invitation.link}`}
                        >
                            {invitation.link}
                        </Text>

                        <Pressable
                            onPress={handleCopy}
                            accessibilityRole="button"
                            accessibilityLabel="Copiar link de convite"
                            style={({ pressed }) => [
                                styles.copyButton,
                                pressed && styles.pressed,
                            ]}
                        >
                            <Text style={styles.copyButtonText}>
                                {isCopied ? '✓  Copiado' : '⧉  Copiar'}
                            </Text>
                        </Pressable>
                    </View>

                    <Text style={styles.expiration}>
                        Código {invitation.code} · expira em {expiresInDays}{' '}
                        {expiresInDays === 1 ? 'dia' : 'dias'}
                    </Text>
                </View>

                {/* Compartilhamento rápido (L-05: sem e-mail no MVP) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Compartilhamento Rápido</Text>

                    <View style={styles.shareRow}>
                        <Pressable
                            onPress={handleWhatsApp}
                            accessibilityRole="button"
                            accessibilityLabel="Compartilhar convite pelo WhatsApp"
                            style={({ pressed }) => [
                                styles.shareTile,
                                pressed && styles.pressed,
                            ]}
                        >
                            <View style={styles.shareIconCircle}>
                                <Text style={styles.shareIcon}>💬</Text>
                            </View>
                            <Text style={styles.shareLabel}>WhatsApp</Text>
                        </Pressable>

                        <Pressable
                            onPress={handleQrCode}
                            accessibilityRole="button"
                            accessibilityLabel="Mostrar QR Code do convite"
                            style={({ pressed }) => [
                                styles.shareTile,
                                pressed && styles.pressed,
                            ]}
                        >
                            <View style={styles.shareIconCircle}>
                                <Text style={styles.shareIcon}>▦</Text>
                            </View>
                            <Text style={styles.shareLabel}>QR Code</Text>
                        </Pressable>
                    </View>
                </View>
            </>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <DetailsHeader
                title="Convidar membros"
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                {renderContent()}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },

    container: {
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
        padding: spacing.xl,
        paddingBottom: spacing.massive,
        gap: spacing.xl,
    },

    pressed: {
        opacity: 0.85,
    },

    intro: {
        gap: spacing.xs,
    },

    introText: {
        ...typography.subtitle,
        fontFamily: fontFamily.regular,
        color: colors.text.primary,
    },

    goalName: {
        ...typography.caption,
        color: colors.text.secondary,
    },

    linkCard: {
        backgroundColor: colors.border.subtle,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.sm,
    },

    linkTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.primary,
    },

    linkDescription: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        lineHeight: 18,
        color: colors.text.secondary,
    },

    linkField: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface.primary,
        borderRadius: radius.md,
        paddingVertical: spacing.sm,
        paddingLeft: spacing.lg,
        paddingRight: spacing.sm,
        marginTop: spacing.xs,
        ...shadows.sm,
    },

    linkText: {
        flex: 1,
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    copyButton: {
        backgroundColor: colors.primary,
        borderRadius: radius.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
    },

    copyButtonText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.inverse,
    },

    expiration: {
        fontFamily: fontFamily.regular,
        fontSize: 11,
        color: colors.text.secondary,
    },

    section: {
        gap: spacing.sm,
    },

    sectionTitle: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },

    shareRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },

    shareTile: {
        flex: 1,
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface.primary,
        borderRadius: radius.md,
        paddingVertical: spacing.lg,
        ...shadows.sm,
    },

    shareIconCircle: {
        width: 44,
        height: 44,
        borderRadius: radius.full,
        backgroundColor: colors.surface.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    shareIcon: {
        fontSize: fontSize.lg,
        color: colors.primary,
    },

    shareLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },
});
