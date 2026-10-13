import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../../../core/theme';

type Props = { step: 1 | 2 | 3 };

/** Ilustração provisória feita em RN; trocar pelo asset exportado do Figma. */
export function OnboardingIllustration({ step }: Props) {
    const details = {
        1: { icon: '◎', heading: 'Seu dinheiro', value: 'R$ 2.450,00', chip: 'Visão geral' },
        2: { icon: '↗', heading: 'Suas metas', value: '75%', chip: 'Em progresso' },
        3: { icon: '♡', heading: 'Juntos', value: 'R$ 7.500', chip: 'Caixinha' },
    }[step];

    return (
        <View style={styles.stage}>
            <View style={styles.circle} />
            <View style={styles.card}>
                <View style={styles.iconBox}><Text style={styles.icon}>{details.icon}</Text></View>
                <Text style={styles.heading}>{details.heading}</Text>
                <Text style={styles.value}>{details.value}</Text>
                <View style={styles.chip}><Text style={styles.chipText}>{details.chip}</Text></View>
                <View style={styles.track}><View style={[styles.fill, { width: step === 2 ? '75%' : '55%' }]} /></View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    stage: { width: '100%', height: 250, alignItems: 'center', justifyContent: 'center' },
    circle: { position: 'absolute', width: 245, height: 245, borderRadius: radius.full, backgroundColor: colors.surface.secondary },
    card: { width: '75%', maxWidth: 260, padding: spacing.xxl, borderRadius: radius.xxl, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border.default, alignItems: 'center', gap: spacing.md, elevation: 3 },
    iconBox: { backgroundColor: colors.surface.secondary, width: 55, height: 55, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
    icon: { color: colors.primary, fontSize: 28 },
    heading: { ...typography.subtitle, color: colors.text.primary },
    value: { ...typography.title, color: colors.primary },
    chip: { backgroundColor: colors.surface.secondary, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
    chipText: { ...typography.caption, color: colors.primary },
    track: { width: '100%', height: 7, borderRadius: radius.full, backgroundColor: colors.border.default, overflow: 'hidden' },
    fill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
});
