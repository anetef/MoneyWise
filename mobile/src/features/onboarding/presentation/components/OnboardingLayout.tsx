import type { ReactNode } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../../../core/theme';

type OnboardingLayoutProps = {
    step: 1 | 2 | 3;
    title: string;
    description: string;
    illustration: ReactNode;
    onNext: () => void;
    onBack?: () => void;
    onSkip: () => void;
};

export function OnboardingLayout({
                                     step,
                                     title,
                                     description,
                                     illustration,
                                     onNext,
                                     onBack,
                                     onSkip,
                                 }: OnboardingLayoutProps) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.topRow}>
                    {onBack ? (
                        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar" style={styles.topAction}>
                            <Text style={styles.topActionText}>← Voltar</Text>
                        </Pressable>
                    ) : <View style={styles.topAction} />}
                    <Pressable onPress={onSkip} accessibilityRole="button" style={styles.topAction}>
                        <Text style={[styles.topActionText, styles.skipText]}>Pular</Text>
                    </Pressable>
                </View>

                <View style={styles.illustration} accessibilityLabel={`Ilustração do passo ${step}`}>
                    {illustration}
                </View>

                <View style={styles.body}>
                    <View style={styles.dots} accessibilityLabel={`Passo ${step} de 3`}>
                        {([1, 2, 3] as const).map((index) => (
                            <View key={index} style={[styles.dot, index === step && styles.activeDot]} />
                        ))}
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>
                </View>

                <Pressable
                    accessibilityRole="button"
                    onPress={onNext}
                    style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                >
                    <Text style={styles.buttonText}>{step === 3 ? 'Começar agora' : 'Continuar'}</Text>
                    <Text style={styles.arrow}>→</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: {
        flexGrow: 1,
        paddingHorizontal: spacing.xxl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xxl,
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
    },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    topAction: { minHeight: 44, minWidth: 72, justifyContent: 'center' },
    topActionText: { ...typography.caption, color: colors.text.secondary },
    skipText: { textAlign: 'right' },
    illustration: {
        flex: 1,
        minHeight: 230,
        maxHeight: 410,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: spacing.xxl,
    },
    body: { alignItems: 'center', marginBottom: spacing.xxxl },
    dots: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xxl },
    dot: { width: 8, height: 8, backgroundColor: colors.border.default, borderRadius: radius.full },
    activeDot: { width: 27, backgroundColor: colors.primary },
    title: { ...typography.heading, color: colors.text.primary, textAlign: 'center', marginBottom: spacing.md },
    description: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
    button: {
        backgroundColor: colors.primary,
        borderRadius: radius.lg,
        minHeight: 56,
        paddingHorizontal: spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    buttonText: { ...typography.button, color: colors.white },
    arrow: { ...typography.title, color: colors.white },
    pressed: { opacity: 0.8 },
});
