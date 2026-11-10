import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import type { MainStackParamList } from '../../../../core/navigation/types';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
    typography,
} from '../../../../core/theme';

import type { InvitationPreview } from '../../domain/InvitationPreview';
import { DetailsHeader } from '../components/DetailsHeader';
import { getInitials } from '../utils/getInitials';
import {
    INVITATION_CODE_LENGTH,
    useAcceptInvitation,
} from '../viewmodels/useAcceptInvitation';

type Props = NativeStackScreenProps<MainStackParamList, 'AcceptInvitation'>;

/** Ex.: "17/11" */
function formatShortDate(isoDate: string) {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${day}/${month}`;
}

/**
 * Aceitar convite (frame novo do Figma), com o visual das telas
 * de Caixinha. A prévia não mostra valores: a API não os envia
 * para quem ainda não participa.
 */
export function AcceptInvitationScreen({ navigation, route }: Props) {
    const viewModel = useAcceptInvitation(route.params?.code);
    const { preview } = viewModel;

    function goToSharedGoals() {
        navigation.navigate('MainTabs', {
            screen: 'Goals',
            params: { createdGoalType: 'shared' },
        });
    }

    function renderCodeStep() {
        return (
            <>
                <View style={styles.intro}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons
                            name="email-open-outline"
                            size={30}
                            color={colors.primary}
                        />
                    </View>

                    <Text style={styles.title}>Entrar numa Caixinha</Text>

                    <Text style={styles.description}>
                        Digite o código que você recebeu de quem te convidou.
                    </Text>
                </View>

                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>CÓDIGO DO CONVITE</Text>

                    <TextInput
                        value={viewModel.code}
                        onChangeText={viewModel.changeCode}
                        onSubmitEditing={viewModel.lookUp}
                        placeholder="Ex.: K7M2QX9TAB"
                        placeholderTextColor={colors.text.secondary}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        autoComplete="off"
                        returnKeyType="go"
                        accessibilityLabel="Código do convite"
                        style={styles.codeInput}
                    />

                    <Text style={styles.helperText}>
                        O código tem {INVITATION_CODE_LENGTH} letras e números.
                        Pode colar a mensagem inteira.
                    </Text>
                </View>

                {viewModel.error ? (
                    <Text style={styles.errorText} accessibilityRole="alert">
                        {viewModel.error}
                    </Text>
                ) : null}

                <Pressable
                    onPress={viewModel.lookUp}
                    disabled={!viewModel.canLookUp}
                    accessibilityRole="button"
                    accessibilityState={{
                        disabled: !viewModel.canLookUp,
                        busy: viewModel.isLoadingPreview,
                    }}
                    style={({ pressed }) => [
                        styles.primaryButton,
                        !viewModel.canLookUp && styles.buttonDisabled,
                        pressed && styles.pressed,
                    ]}
                >
                    {viewModel.isLoadingPreview ? (
                        <ActivityIndicator color={colors.text.inverse} />
                    ) : (
                        <Text style={styles.primaryButtonText}>Ver convite</Text>
                    )}
                </Pressable>
            </>
        );
    }

    function renderPreviewStep(invitation: InvitationPreview) {
        const participants =
            invitation.memberCount === 1
                ? '1 participante'
                : `${invitation.memberCount} participantes`;

        return (
            <>
                {/* Quem convidou → Caixinha */}
                <View style={styles.connection} accessible={false}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {getInitials(invitation.invitedByName)}
                        </Text>
                    </View>
                    <View style={styles.connectionLine} />
                    <View style={[styles.avatar, styles.avatarGoal]}>
                        <MaterialCommunityIcons
                            name="piggy-bank-outline"
                            size={26}
                            color={colors.text.inverse}
                        />
                    </View>
                </View>

                <View style={styles.introCompact}>
                    <Text style={styles.title}>
                        {invitation.invitedByName} convidou você
                    </Text>
                    <Text style={styles.description}>
                        Vocês podem guardar dinheiro e acompanhar o progresso juntos.
                    </Text>
                </View>

                {/* Caixinha */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIcon}>
                            <MaterialCommunityIcons
                                name="gift-outline"
                                size={22}
                                color={colors.primary}
                            />
                        </View>

                        <View style={styles.cardTitleBox}>
                            <Text style={styles.cardLabel}>CAIXINHA COMPARTILHADA</Text>
                            <Text style={styles.cardTitle}>{invitation.groupName}</Text>
                        </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardFooter}>
                        <Text style={styles.cardInfo}>{participants}</Text>
                        <Text style={styles.cardInfo}>
                            Válido até {formatShortDate(invitation.expiresAt)}
                        </Text>
                    </View>
                </View>

                {viewModel.error ? (
                    <Text style={styles.errorText} accessibilityRole="alert">
                        {viewModel.error}
                    </Text>
                ) : null}

                {invitation.alreadyMember ? (
                    <>
                        <Text style={styles.infoText} accessibilityRole="alert">
                            Você já participa desta Caixinha.
                        </Text>

                        <Pressable
                            onPress={goToSharedGoals}
                            accessibilityRole="button"
                            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                        >
                            <Text style={styles.primaryButtonText}>Voltar para Caixinhas</Text>
                        </Pressable>
                    </>
                ) : (
                    <View style={styles.actions}>
                        <Pressable
                            onPress={viewModel.accept}
                            disabled={viewModel.isAccepting}
                            accessibilityRole="button"
                            accessibilityState={{
                                disabled: viewModel.isAccepting,
                                busy: viewModel.isAccepting,
                            }}
                            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                        >
                            <Text style={styles.primaryButtonText}>
                                {viewModel.isAccepting ? 'Aceitando...' : 'Aceitar convite'}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => navigation.goBack()}
                            disabled={viewModel.isAccepting}
                            accessibilityRole="button"
                            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                        >
                            <Text style={styles.secondaryButtonText}>Recusar</Text>
                        </Pressable>
                    </View>
                )}
            </>
        );
    }

    function renderAcceptedStep(invitation: InvitationPreview) {
        return (
            <>
                <View style={styles.intro}>
                    <View style={[styles.iconCircle, styles.iconCircleSuccess]}>
                        <MaterialCommunityIcons
                            name="check"
                            size={32}
                            color={colors.status.success}
                        />
                    </View>

                    <Text style={styles.title} accessibilityRole="alert">
                        Pronto!
                    </Text>

                    <Text style={styles.description}>
                        Você entrou na Caixinha {invitation.groupName}.
                    </Text>
                </View>

                <Pressable
                    onPress={goToSharedGoals}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                >
                    <Text style={styles.primaryButtonText}>Ir para Caixinhas</Text>
                </Pressable>
            </>
        );
    }

    return (
        <SafeAreaView style={styles.screen} edges={['top']}>
            <DetailsHeader
                title="Convite para caixinha"
                onBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {!preview && renderCodeStep()}
                    {preview && !viewModel.isAccepted && renderPreviewStep(preview)}
                    {preview && viewModel.isAccepted && renderAcceptedStep(preview)}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },

    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },

    container: {
        padding: spacing.xl,
        paddingBottom: spacing.massive,
        gap: spacing.xl,
    },

    intro: {
        alignItems: 'center',
        gap: spacing.sm,
        paddingTop: spacing.lg,
    },

    introCompact: {
        alignItems: 'center',
        gap: spacing.sm,
    },

    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: radius.full,
        backgroundColor: colors.surface.primary,
        borderWidth: 1,
        borderColor: colors.border.default,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },

    iconCircleSuccess: {
        borderColor: colors.status.success,
    },

    title: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.text.primary,
        textAlign: 'center',
    },

    description: {
        ...typography.body,
        color: colors.text.secondary,
        textAlign: 'center',
    },

    field: {
        gap: spacing.sm,
    },

    fieldLabel: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        letterSpacing: 0.7,
    },

    codeInput: {
        minHeight: 56,
        backgroundColor: colors.surface.primary,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border.default,
        paddingHorizontal: spacing.lg,
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.lg,
        letterSpacing: 2,
        color: colors.text.primary,
    },

    helperText: {
        ...typography.caption,
        color: colors.text.secondary,
    },

    errorText: {
        ...typography.caption,
        color: colors.status.error,
        textAlign: 'center',
    },

    infoText: {
        ...typography.body,
        color: colors.text.primary,
        textAlign: 'center',
    },

    connection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.lg,
    },

    avatar: {
        width: 64,
        height: 64,
        borderRadius: radius.full,
        backgroundColor: '#F6E5DD',
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarGoal: {
        backgroundColor: colors.primary,
    },

    avatarText: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.primary,
    },

    connectionLine: {
        width: 48,
        height: 3,
        borderRadius: radius.full,
        backgroundColor: '#F6E5DD',
    },

    card: {
        backgroundColor: colors.surface.primary,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        padding: spacing.lg,
        gap: spacing.md,
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },

    cardIcon: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: '#F6E5DD',
        alignItems: 'center',
        justifyContent: 'center',
    },

    cardTitleBox: {
        flex: 1,
        gap: spacing.xxs,
    },

    cardLabel: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        letterSpacing: 0.7,
    },

    cardTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.text.primary,
    },

    cardDivider: {
        height: 1,
        backgroundColor: colors.border.subtle,
    },

    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },

    cardInfo: {
        ...typography.caption,
        color: colors.text.secondary,
    },

    actions: {
        gap: spacing.md,
    },

    primaryButton: {
        minHeight: 52,
        borderRadius: radius.md,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },

    primaryButtonText: {
        ...typography.button,
        color: colors.text.inverse,
    },

    secondaryButton: {
        minHeight: 52,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: colors.surface.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    secondaryButtonText: {
        ...typography.button,
        color: colors.primary,
    },

    buttonDisabled: {
        opacity: 0.45,
    },

    pressed: {
        opacity: 0.85,
    },
});
