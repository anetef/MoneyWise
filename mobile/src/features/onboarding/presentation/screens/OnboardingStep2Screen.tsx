import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
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
    'OnboardingStep2'
>;

const GREEN = '#15803D';
const SOFT_BLUE = '#E4ECFF';
const SECONDARY_BLUE = '#F3F6FF';

export function OnboardingStep2Screen({ navigation }: Props) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
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

                    <Text style={styles.brand}>MoneyWise</Text>

                    <Pressable
                        onPress={() => navigation.replace('Welcome')}
                        accessibilityRole="button"
                    >
                        <Text style={styles.skip}>Pular</Text>
                    </Pressable>
                </View>

                {/* Prévia das Caixinhas */}
                <View style={styles.preview}>
                    <View style={styles.segmented}>
                        <View style={styles.inactiveSegment}>
                            <Text style={styles.inactiveSegmentText}>
                                Individuais
                            </Text>
                        </View>

                        <View style={styles.activeSegment}>
                            <Text style={styles.activeSegmentText}>
                                Coletivas
                            </Text>
                        </View>
                    </View>

                    {/* Caixinha principal */}
                    <View style={styles.goalCard}>
                        <View style={styles.goalContent}>
                            <View style={styles.goalHeader}>
                                <View style={styles.goalIcon}>
                                    <Text style={styles.goalIconText}>✈</Text>
                                </View>

                                <View style={styles.goalInfo}>
                                    <Text style={styles.goalTitle}>
                                        Viagem Japão 2025
                                    </Text>
                                    <Text style={styles.goalSubtitle}>
                                        Meta até Dezembro
                                    </Text>
                                </View>

                                <View style={styles.progressCircle}>
                                    <Text style={styles.progressPercent}>
                                        65%
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.amountRow}>
                                <View>
                                    <Text style={styles.amountLabel}>
                                        Total acumulado
                                    </Text>
                                    <Text style={styles.savedAmount}>
                                        R$ 9.750
                                    </Text>
                                </View>

                                <View style={styles.targetColumn}>
                                    <Text style={styles.amountLabel}>
                                        Objetivo final
                                    </Text>
                                    <Text style={styles.targetAmount}>
                                        R$ 15.000
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Rodapé dos participantes */}
                        <View style={styles.membersFooter}>
                            <View style={styles.avatars}>
                                <View style={[styles.avatar, styles.avatarOne]}>
                                    <Text style={styles.avatarText}>M</Text>
                                </View>
                                <View style={[styles.avatar, styles.avatarTwo]}>
                                    <Text style={styles.avatarText}>A</Text>
                                </View>
                                <View style={[styles.avatar, styles.avatarThree]}>
                                    <Text style={styles.avatarText}>J</Text>
                                </View>
                                <View style={styles.avatarExtra}>
                                    <Text style={styles.extraText}>+2</Text>
                                </View>
                            </View>

                            <Text style={styles.membersText}>
                                5 membros ativos
                            </Text>
                        </View>
                    </View>

                    {/* Caixinha secundária */}
                    <View style={styles.secondaryGoal}>
                        <View style={styles.secondaryIcon}>
                            <Text style={styles.secondaryIconText}>
                                ⚒
                            </Text>
                        </View>

                        <View style={styles.secondaryInfo}>
                            <Text style={styles.secondaryTitle}>
                                Reforma do Apê
                            </Text>
                            <Text style={styles.secondarySubtitle}>
                                R$ 4.200 de R$ 8.000
                            </Text>
                        </View>

                        <View style={styles.arrowCircle}>
                            <Text style={styles.arrowText}>›</Text>
                        </View>
                    </View>
                </View>

                {/* Conteúdo da apresentação */}
                <View style={styles.content}>
                    <Text style={styles.title}>
                        Caixinhas para cada objetivo da sua vida
                    </Text>

                    <Text style={styles.description}>
                        Guarde dinheiro individualmente ou em grupo
                        com regras claras, foco total e transparência
                        em tempo real.
                    </Text>
                </View>

                {/* Rodapé */}
                <View style={styles.footer}>
                    <View style={styles.indicators}>
                        <View style={styles.inactiveIndicator} />
                        <View style={styles.activeIndicator} />
                        <View style={styles.inactiveIndicator} />
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.pressed,
                        ]}
                        accessibilityRole="button"
                        onPress={() =>
                            navigation.navigate('OnboardingStep3')
                        }
                    >
                        <Text style={styles.buttonText}>
                            Continuar →
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => navigation.goBack()}
                        accessibilityRole="button"
                        style={styles.bottomBack}
                    >
                        <Text style={styles.bottomBackText}>
                            Voltar
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
        paddingTop: spacing.lg,
        paddingBottom: spacing.xxl,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xxl,
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
        color: colors.text.primary,
        fontSize: 32,
        lineHeight: 37,
    },

    brand: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.text.primary,
    },

    skip: {
        ...typography.caption,
        color: colors.text.secondary,
    },

    preview: {
        backgroundColor: colors.surface.secondary,
        padding: spacing.lg,
        borderRadius: radius.lg,
        gap: spacing.sm,
        marginBottom: spacing.xxxl,
    },

    segmented: {
        flexDirection: 'row',
        backgroundColor: SOFT_BLUE,
        borderRadius: radius.md,
        padding: spacing.xs,
        minHeight: 44,
    },

    inactiveSegment: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    activeSegment: {
        flex: 1,
        borderRadius: radius.sm,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },

    inactiveSegmentText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },

    activeSegmentText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.primary,
    },

    goalCard: {
        backgroundColor: colors.white,
        borderRadius: radius.lg,
        overflow: 'hidden',
    },

    goalContent: {
        padding: spacing.lg,
    },

    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },

    goalIcon: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    goalIconText: {
        fontSize: 26,
        color: colors.white,
    },

    goalInfo: {
        flex: 1,
    },

    goalTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.lg,
        lineHeight: 24,
        color: colors.text.primary,
    },

    goalSubtitle: {
        ...typography.caption,
        color: colors.text.secondary,
    },

    progressCircle: {
        width: 48,
        height: 48,
        borderRadius: radius.full,
        borderWidth: 5,
        borderTopColor: colors.primary,
        borderRightColor: colors.primary,
        borderBottomColor: colors.primary,
        borderLeftColor: '#D8E5FF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    progressPercent: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xs,
        color: colors.primary,
    },

    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xxl,
    },

    amountLabel: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },

    savedAmount: {
        ...typography.title,
        color: colors.text.primary,
    },

    targetColumn: {
        alignItems: 'flex-end',
    },

    targetAmount: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.text.secondary,
    },

    membersFooter: {
        backgroundColor: SECONDARY_BLUE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },

    avatars: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: spacing.xs,
    },

    avatar: {
        width: 30,
        height: 30,
        borderRadius: radius.full,
        borderWidth: 2,
        borderColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -4,
    },

    avatarOne: {
        backgroundColor: '#A6BC9C',
    },

    avatarTwo: {
        backgroundColor: '#CAA486',
    },

    avatarThree: {
        backgroundColor: '#9CAEC7',
    },

    avatarText: {
        color: colors.white,
        fontFamily: fontFamily.bold,
        fontSize: 11,
    },

    avatarExtra: {
        width: 30,
        height: 30,
        borderRadius: radius.full,
        backgroundColor: '#D6E4FF',
        borderWidth: 2,
        borderColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -4,
    },

    extraText: {
        fontFamily: fontFamily.semiBold,
        fontSize: 11,
        color: colors.text.primary,
    },

    membersText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    secondaryGoal: {
        backgroundColor: '#FAFBFF',
        borderRadius: radius.md,
        padding: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },

    secondaryIcon: {
        width: 42,
        height: 42,
        borderRadius: radius.sm,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    secondaryIconText: {
        fontSize: 22,
        color: colors.white,
    },

    secondaryInfo: {
        flex: 1,
        gap: spacing.xs,
    },

    secondaryTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },

    secondarySubtitle: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },

    arrowCircle: {
        width: 36,
        height: 36,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    arrowText: {
        color: colors.white,
        fontSize: 28,
        lineHeight: 32,
    },

    content: {
        alignItems: 'center',
        marginTop: 'auto',
        paddingTop: spacing.md,
        gap: spacing.sm,
    },

    title: {
        ...typography.heading,
        fontSize: 29,
        lineHeight: 36,
        letterSpacing: -0.8,
        color: colors.text.primary,
        textAlign: 'center',
    },

    description: {
        ...typography.body,
        color: colors.text.secondary,
        lineHeight: 23,
        textAlign: 'center',
    },

    footer: {
        marginTop: spacing.xxl,
        gap: spacing.xxl,
    },

    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },

    inactiveIndicator: {
        width: 8,
        height: 8,
        borderRadius: radius.full,
        backgroundColor: '#CFE0FF',
    },

    activeIndicator: {
        width: 28,
        height: 8,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
    },

    button: {
        backgroundColor: colors.primary,
        minHeight: 50,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonText: {
        ...typography.button,
        color: colors.white,
    },

    bottomBack: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },

    bottomBackText: {
        ...typography.caption,
        color: colors.text.secondary,
    },

    pressed: {
        opacity: 0.8,
    },
});