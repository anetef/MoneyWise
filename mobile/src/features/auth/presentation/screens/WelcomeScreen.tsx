
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Image,
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
    'Welcome'
>;

const PREVIEW_BACKGROUND = '#E7EEFF';
const HERO_BACKGROUND = '#F1F0EC';

export function WelcomeScreen({ navigation }: Props) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Indicador decorativo superior */}
                <View style={styles.topIndicator} />

                {/* Ilustração */}
                <View style={styles.previewContainer}>
                    <View style={styles.hero}>
                        <View style={styles.illustration}>
                            <Text style={styles.leafLeft}>🌿</Text>

                            <View style={styles.boxes}>
                                <View style={styles.backBox} />

                                <View style={styles.frontBoxes}>
                                    <View style={styles.leftBox}>
                                        <Text style={styles.boxSymbol}>✦</Text>
                                    </View>

                                    <View style={styles.rightBox}>
                                        <Text style={styles.boxSymbol}>✦</Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.leafRight}>🌿</Text>
                        </View>

                        <View style={styles.coins}>
                            <Text style={styles.coinsText}>🪙 🪙 🪙</Text>
                        </View>
                    </View>

                    {/* Card sobreposto */}
                    <View style={styles.goalCard}>
                        <View style={styles.goalIcon}>
                            <Text style={styles.goalIconText}>↗</Text>
                        </View>

                        <View style={styles.goalInfo}>
                            <Text style={styles.goalLabel}>
                                Meta Coletiva
                            </Text>

                            <Text style={styles.goalValue}>
                                R$ 18.450 guardados
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Título e descrição */}
                <View style={styles.content}>
                    <Text style={styles.title}>
                        Bem-vindo ao MoneyWise
                    </Text>

                    <Text style={styles.description}>
                        Controle suas finanças pessoais e construa
                        metas compartilhadas sem complicação.
                    </Text>
                </View>

                {/* Ações */}
                <View style={styles.footer}>
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => navigation.navigate('Register')}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.primaryButtonText}>
                            Criar nova conta →
                        </Text>
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        onPress={() => navigation.navigate('Login')}
                        style={({ pressed }) => [
                            styles.secondaryButton,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.secondaryButtonText}>
                            Entrar na minha conta
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
        paddingTop: spacing.sm,
        paddingBottom: spacing.xxl,
    },

    topIndicator: {
        width: 32,
        height: 12,
        borderRadius: radius.full,
        backgroundColor: colors.surface.secondary,
        alignSelf: 'center',
        marginBottom: spacing.lg,
    },

    previewContainer: {
        backgroundColor: PREVIEW_BACKGROUND,
        borderRadius: radius.lg,
        padding: spacing.sm,
        paddingBottom: spacing.sm,
        marginBottom: spacing.xl,
    },

    hero: {
        minHeight: 240,
        backgroundColor: HERO_BACKGROUND,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        paddingBottom: spacing.xxxl,
    },

    illustration: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xl,
    },

    leafLeft: {
        fontSize: 42,
        transform: [{ rotate: '-25deg' }],
    },

    leafRight: {
        fontSize: 42,
        transform: [{ rotate: '25deg' }],
    },

    boxes: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    backBox: {
        width: 65,
        height: 65,
        backgroundColor: '#4C9C7D',
        borderRadius: radius.sm,
        transform: [{ rotate: '10deg' }],
        borderWidth: 3,
        borderColor: '#85C8AB',
    },

    frontBoxes: {
        flexDirection: 'row',
        marginTop: -15,
        gap: spacing.xs,
    },

    leftBox: {
        width: 58,
        height: 58,
        backgroundColor: '#0E7759',
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },

    rightBox: {
        width: 58,
        height: 58,
        backgroundColor: '#248E6F',
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },

    boxSymbol: {
        fontSize: 27,
        color: '#A7E2BF',
    },

    coins: {
        marginTop: spacing.sm,
    },

    coinsText: {
        fontSize: 22,
    },

    goalCard: {
        backgroundColor: colors.white,
        borderRadius: radius.md,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginTop: -34,
        minHeight: 68,
    },

    goalIcon: {
        width: 36,
        height: 36,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    goalIconText: {
        color: colors.white,
        fontSize: fontSize.xl,
        fontFamily: fontFamily.bold,
    },

    goalInfo: {
        flex: 1,
    },

    goalLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    goalValue: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },

    content: {
        alignItems: 'center',
        gap: spacing.xxl,
        marginBottom: spacing.xxl,
    },

    title: {
        fontFamily: fontFamily.bold,
        fontSize: 27,
        lineHeight: 36,
        letterSpacing: -0.8,
        color: colors.text.primary,
        textAlign: 'center',
    },

    description: {
        ...typography.body,
        color: colors.text.secondary,
        lineHeight: 24,
        textAlign: 'center',
        maxWidth: 350,
    },

    footer: {
        marginTop: 'auto',
        gap: spacing.sm,
    },

    primaryButton: {
        minHeight: 52,
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },

    primaryButtonText: {
        ...typography.button,
        color: colors.white,
    },

    secondaryButton: {
        minHeight: 52,
        backgroundColor: colors.surface.secondary,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },

    secondaryButtonText: {
        ...typography.button,
        color: colors.text.primary,
    },

    pressed: {
        opacity: 0.8,
    },
});
