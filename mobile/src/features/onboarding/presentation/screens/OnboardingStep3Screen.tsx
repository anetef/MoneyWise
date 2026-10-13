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
    'OnboardingStep3'
>;

const SOFT_BLUE = '#EDF3FF';
const LIGHT_GREEN = '#B9C8BB';
const SUCCESS_GREEN = '#0E8A61';

export function OnboardingStep3Screen({ navigation }: Props) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <Pressable
                        onPress={() => navigation.goBack()}
                        accessibilityRole="button"
                        accessibilityLabel="Voltar"
                        style={styles.backButton}
                    >
                        <Text style={styles.backIcon}>‹</Text>
                    </Pressable>

                    <Text style={styles.brand}>MoneyWise</Text>

                    <View style={styles.headerSpacer} />
                </View>

                {/* Card superior */}
                <View style={styles.previewCard}>
                    <View style={styles.goalSummary}>
                        <View style={styles.goalHeader}>
                            <View style={styles.goalLeft}>
                                <Text style={styles.goalIcon}>✈</Text>
                                <Text style={styles.goalTitle}>Viagem em Grupo</Text>
                            </View>

                            <Text style={styles.goalPercent}>100%</Text>
                        </View>

                        <View style={styles.progressTrack}>
                            <View style={styles.progressFill} />
                        </View>

                        <View style={styles.goalFooter}>
                            <Text style={styles.goalSubtitle}>
                                Meta alcançada em equipe
                            </Text>
                            <Text style={styles.goalStatus}>Concluída</Text>
                        </View>
                    </View>

                    <View style={styles.benefits}>
                        <BenefitItem text="Visão de extratos em tempo real" />
                        <BenefitItem text="Divisão justa de metas e aportes" />
                        <BenefitItem text="Sem taxas nem complicação" />
                    </View>
                </View>

                {/* Conteúdo textual */}
                <View style={styles.content}>
                    <Text style={styles.title}>
                        Tudo pronto para transformar suas metas
                    </Text>

                    <Text style={styles.description}>
                        Comece a planejar e poupar com quem você
                        confia, ou construa seus objetivos individuais
                        com clareza total.
                    </Text>
                </View>

                {/* Rodapé */}
                <View style={styles.footer}>
                    <View style={styles.indicators}>
                        <View style={styles.inactiveGreenIndicator} />
                        <View style={styles.inactiveGreenIndicator} />
                        <View style={styles.activeIndicator} />
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && styles.pressed,
                        ]}
                        accessibilityRole="button"
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.primaryButtonText}>
                            Criar conta gratuita →
                        </Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.secondaryButton,
                            pressed && styles.pressed,
                        ]}
                        accessibilityRole="button"
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.secondaryButtonText}>
                            Já tenho uma conta / Entrar
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function BenefitItem({ text }: { text: string }) {
    return (
        <View style={styles.benefitItem}>
            <View style={styles.checkCircle}>
                <Text style={styles.checkIcon}>✓</Text>
            </View>

            <Text style={styles.benefitText}>{text}</Text>
        </View>
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
        marginBottom: spacing.xxxl,
    },

    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },

    backIcon: {
        fontSize: 38,
        lineHeight: 38,
        color: colors.text.primary,
    },

    brand: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.lg,
        color: colors.text.primary,
    },

    headerSpacer: {
        width: 40,
    },

    previewCard: {
        backgroundColor: colors.white,
        borderRadius: radius.lg,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        marginBottom: spacing.xxxl,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },

    goalSummary: {
        backgroundColor: SOFT_BLUE,
        borderRadius: radius.md,
        padding: spacing.lg,
        marginBottom: spacing.xl,
    },

    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.sm,
    },

    goalLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flex: 1,
    },

    goalIcon: {
        color: colors.primary,
        fontSize: fontSize.lg,
    },

    goalTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.lg,
        color: colors.text.primary,
        flexShrink: 1,
    },

    goalPercent: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.primary,
    },

    progressTrack: {
        marginTop: spacing.md,
        height: 8,
        borderRadius: radius.full,
        backgroundColor: '#D7E0F5',
        overflow: 'hidden',
    },

    progressFill: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: radius.full,
    },

    goalFooter: {
        marginTop: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.sm,
    },

    goalSubtitle: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },

    goalStatus: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: SUCCESS_GREEN,
    },

    benefits: {
        gap: spacing.lg,
    },

    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },

    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },

    checkIcon: {
        color: colors.white,
        fontSize: fontSize.md,
        fontFamily: fontFamily.bold,
        lineHeight: 18,
    },

    benefitText: {
        flex: 1,
        fontFamily: fontFamily.regular,
        fontSize: fontSize.lg,
        lineHeight: 26,
        color: colors.text.primary,
    },

    content: {
        alignItems: 'center',
        marginTop: 'auto',
        paddingTop: spacing.lg,
        gap: spacing.md,
    },

    title: {
        ...typography.heading,
        fontSize: 30,
        lineHeight: 38,
        letterSpacing: -0.9,
        color: colors.text.primary,
        textAlign: 'center',
        maxWidth: 320,
    },

    description: {
        ...typography.body,
        color: colors.text.secondary,
        lineHeight: 24,
        textAlign: 'center',
        maxWidth: 340,
    },

    footer: {
        marginTop: spacing.xxl,
        gap: spacing.lg,
    },

    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },

    inactiveGreenIndicator: {
        width: 8,
        height: 8,
        borderRadius: radius.full,
        backgroundColor: LIGHT_GREEN,
    },

    activeIndicator: {
        width: 28,
        height: 8,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
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
        color: colors.white,
    },

    secondaryButton: {
        minHeight: 52,
        borderRadius: radius.md,
        backgroundColor: colors.surface.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },

    secondaryButtonText: {
        ...typography.button,
        color: colors.text.primary,
    },

    pressed: {
        opacity: 0.82,
    },
});