import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    shadows,
    spacing,
    typography,
} from '../../../../core/theme';

import { DetailsHeader } from '../components/DetailsHeader';
import { EmptyState } from '../components/EmptyState';
import { goalColors } from '../components/goalColors';
import { getGoalVisual } from '../components/goalVisuals';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDayHeader } from '../utils/formatDate';
import { useGoalContribution } from '../viewmodels/useGoalContribution';

type Props = NativeStackScreenProps<MainStackParamList, 'GoalContribution'>;

const whiteSoft = 'rgba(255, 255, 255, 0.8)';
const whiteGlass = 'rgba(255, 255, 255, 0.18)';

/** Largura aproximada do valor, para "R$ + valor" ficar centralizado. */
function amountInputWidth(text: string): number {
    return Math.min(Math.max(text.length, 4) * 20 + 8, 280);
}

/**
 * Registrar Aporte (MGO-06), frame "Adicionar Transação (Variante)"
 * conforme a decisão L-20.
 *
 * Na Caixinha individual, o mesmo aporte aparece como "Entrada",
 * com a retirada (L-07) visível e desabilitada nesta entrega.
 * Na compartilhada, a tela mostra apenas o aporte.
 * Categoria e anexos não fazem parte do aporte e foram omitidos.
 */
export function GoalContributionScreen({ navigation, route }: Props) {
    const {
        goal,
        isLoading,
        amountText,
        description,
        errors,
        isSaving,
        changeAmount,
        changeDescription,
        save,
    } = useGoalContribution(route.params.goalId);

    const isShared = goal?.type !== 'individual';
    const noun = isShared ? 'Aporte' : 'Entrada';

    async function handleSave() {
        if (await save()) {
            navigation.goBack();
        }
    }

    function renderContent() {
        if (isLoading) {
            return <ActivityIndicator color={colors.primary} style={styles.loading} />;
        }

        if (!goal) {
            return (
                <View style={styles.emptyArea}>
                    <EmptyState
                        title="Caixinha não encontrada"
                        description="Volte e selecione outra caixinha."
                    />
                </View>
            );
        }

        const visual = getGoalVisual(goal.id);

        return (
            <>
                {/* Bloco terracota com o valor */}
                <View style={styles.hero}>
                    {/* Saldo da Caixinha, não o saldo pessoal (RN08) */}
                    <View
                        style={styles.goalChip}
                        accessibilityLabel={`${goal.name}, saldo ${formatCurrency(goal.accumulatedAmount)}`}
                    >
                        <Text style={styles.goalChipText} numberOfLines={1}>
                            {visual.icon}  {goal.name}  {formatCurrency(goal.accumulatedAmount)}
                        </Text>
                    </View>

                    {/* Retirada decidida em L-07, fora desta entrega */}
                    {!isShared && (
                        <View style={styles.toggle}>
                            <Pressable
                                disabled
                                style={[styles.toggleItem, styles.toggleItemDisabled]}
                                accessibilityRole="button"
                                accessibilityState={{ disabled: true }}
                                accessibilityLabel="Retirada, em breve"
                            >
                                <Text style={styles.toggleText}>↓ Retirada</Text>
                                <View style={styles.soonBadge}>
                                    <Text style={styles.soonBadgeText}>Em breve</Text>
                                </View>
                            </Pressable>

                            <View
                                style={[styles.toggleItem, styles.toggleItemActive]}
                                accessibilityState={{ selected: true }}
                            >
                                <Text style={[styles.toggleText, styles.toggleTextActive]}>
                                    ↑ {noun}
                                </Text>
                            </View>
                        </View>
                    )}

                    <Text style={styles.amountLabel}>
                        {isShared ? 'Valor do aporte' : 'Valor da entrada'}
                    </Text>

                    <View style={styles.amountRow}>
                        <Text style={styles.currency}>R$</Text>
                        <TextInput
                            style={[styles.amountInput, { width: amountInputWidth(amountText) }]}
                            value={amountText}
                            onChangeText={changeAmount}
                            placeholder="0,00"
                            placeholderTextColor={whiteSoft}
                            keyboardType="number-pad"
                            accessibilityLabel={`Valor ${isShared ? 'do aporte' : 'da entrada'}`}
                        />
                    </View>
                </View>

                <View style={styles.body}>
                    {errors.amount && (
                        <Text style={styles.errorText} accessibilityRole="alert">
                            {errors.amount}
                        </Text>
                    )}

                    {/* Detalhes */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Detalhes</Text>

                        <View style={styles.card}>
                            {/* Descrição só nos dados simulados; não confirmada no contrato */}
                            <View style={styles.detailRow}>
                                <View style={styles.detailIcon}>
                                    <Text style={styles.detailIconText}>✎</Text>
                                </View>

                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>
                                        Descrição (opcional)
                                    </Text>
                                    <TextInput
                                        style={styles.detailInput}
                                        value={description}
                                        onChangeText={changeDescription}
                                        placeholder="Ex.: Economia do mês"
                                        placeholderTextColor={colors.text.secondary}
                                        maxLength={80}
                                        accessibilityLabel="Descrição, opcional"
                                    />
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Data do registro, definida pelo sistema */}
                            <View style={styles.detailRow}>
                                <View style={styles.detailIcon}>
                                    <Text style={styles.detailIconText}>▦</Text>
                                </View>

                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Data</Text>
                                    <Text style={styles.detailValue}>
                                        {formatDayHeader(new Date().toISOString())}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {errors.submit && (
                        <Text style={styles.errorText} accessibilityRole="alert">
                            {errors.submit}
                        </Text>
                    )}
                </View>
            </>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <DetailsHeader
                title={`Registrar ${noun}`}
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
                    {renderContent()}
                </ScrollView>

                {goal && (
                    <View style={styles.footer}>
                        <Pressable
                            onPress={handleSave}
                            disabled={isSaving}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: isSaving }}
                            style={({ pressed }) => [
                                styles.saveButton,
                                (pressed || isSaving) && styles.pressed,
                            ]}
                        >
                            <Text style={styles.saveButtonIcon}>✓</Text>
                            <Text style={styles.saveButtonText}>Salvar {noun}</Text>
                        </Pressable>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },

    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },

    container: {
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
        paddingBottom: spacing.xxl,
    },

    loading: {
        marginTop: spacing.xxl,
    },

    emptyArea: {
        padding: spacing.xl,
    },

    hero: {
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.primary,
        borderBottomLeftRadius: radius.xxl,
        borderBottomRightRadius: radius.xxl,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing.xxxl,
    },

    goalChip: {
        alignSelf: 'stretch',
        alignItems: 'center',
        backgroundColor: whiteGlass,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },

    goalChipText: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: whiteSoft,
    },

    toggle: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        backgroundColor: whiteGlass,
        borderRadius: radius.full,
        padding: spacing.xs,
    },

    toggleItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        borderRadius: radius.full,
        paddingVertical: spacing.sm,
    },

    toggleItemActive: {
        backgroundColor: colors.surface.primary,
    },

    toggleItemDisabled: {
        opacity: 0.6,
    },

    toggleText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: whiteSoft,
    },

    toggleTextActive: {
        color: colors.primary,
    },

    soonBadge: {
        backgroundColor: whiteGlass,
        borderRadius: radius.full,
        paddingHorizontal: spacing.xs,
        paddingVertical: 1,
    },

    soonBadgeText: {
        fontFamily: fontFamily.medium,
        fontSize: 10,
        color: colors.text.inverse,
    },

    amountLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: whiteSoft,
    },

    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
    },

    currency: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xl,
        color: whiteSoft,
    },

    amountInput: {
        fontFamily: fontFamily.bold,
        fontSize: 32,
        color: colors.text.inverse,
        paddingVertical: 0,
    },

    body: {
        padding: spacing.xl,
        gap: spacing.xl,
    },

    errorText: {
        ...typography.caption,
        fontSize: fontSize.xs,
        color: colors.status.error,
        textAlign: 'center',
    },

    section: {
        gap: spacing.sm,
    },

    sectionTitle: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },

    card: {
        backgroundColor: colors.surface.primary,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        ...shadows.sm,
    },

    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
    },

    detailIcon: {
        width: 40,
        height: 40,
        borderRadius: radius.full,
        backgroundColor: goalColors.primaryTint,
        alignItems: 'center',
        justifyContent: 'center',
    },

    detailIconText: {
        fontSize: fontSize.md,
        color: colors.primary,
    },

    detailContent: {
        flex: 1,
        gap: spacing.xxs,
    },

    detailLabel: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    detailInput: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        color: colors.text.primary,
        paddingVertical: 0,
    },

    detailValue: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },

    divider: {
        height: 1,
        backgroundColor: colors.border.subtle,
    },

    footer: {
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },

    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: spacing.lg,
        ...shadows.sm,
    },

    pressed: {
        opacity: 0.85,
    },

    saveButtonIcon: {
        fontSize: fontSize.lg,
        color: colors.text.inverse,
    },

    saveButtonText: {
        ...typography.button,
        color: colors.text.inverse,
    },
});
