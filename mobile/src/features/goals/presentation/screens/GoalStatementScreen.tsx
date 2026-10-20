import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
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
import { goalColors } from '../components/goalColors';
import { GoalRecordItem } from '../components/GoalRecordItem';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { formatCurrency } from '../utils/formatCurrency';
import {
    useGoalStatement,
    type StatementFilter,
    type StatementPeriod,
} from '../viewmodels/useGoalStatement';

type Props = NativeStackScreenProps<MainStackParamList, 'GoalStatement'>;

const filterOptions: { value: StatementFilter; label: string }[] = [
    { value: 'all', label: 'Tudo' },
    { value: 'deposit', label: 'Entradas' },
    { value: 'withdrawal', label: 'Saídas' },
];

const periodOptions: { value: StatementPeriod; label: string }[] = [
    { value: 'all', label: 'Todo o período' },
    { value: 'last7', label: 'Últimos 7 dias' },
    { value: 'last30', label: 'Últimos 30 dias' },
];

const periodLabels: Record<StatementPeriod, string> = {
    all: 'Todo o período',
    last7: 'Últimos 7 dias',
    last30: 'Últimos 30 dias',
};

type ChipProps = {
    label: string;
    selected: boolean;
    onPress: () => void;
};

/** Opção do painel de filtros. */
function FilterChip({ label, selected, onPress }: ChipProps) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            aria-selected={selected}
            style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.pressed,
            ]}
        >
            <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
                numberOfLines={1}
            >
                {label}
            </Text>
        </Pressable>
    );
}

const emptyMessages: Record<StatementFilter, string> = {
    all: 'Nenhum registro nesta caixinha ainda.',
    deposit: 'Nenhuma entrada registrada.',
    withdrawal: 'Nenhuma saída registrada.',
};

/**
 * Extrato da Caixinha ("Todos os registros").
 *
 * Lista somente os movimentos da Caixinha, agrupados
 * por dia; nunca transações pessoais (RN02). Os filtros de
 * período e membro (MGO-08) não alteram o Saldo Acumulado.
 */
export function GoalStatementScreen({ navigation, route }: Props) {
    const {
        goal,
        sections,
        filter,
        setFilter,
        period,
        setPeriod,
        memberName,
        setMemberName,
        memberOptions,
        activeFilterCount,
        clearFilters,
        isLoading,
        reload,
    } = useGoalStatement(route.params.goalId);

    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const hasFilters = activeFilterCount > 0;

    useFocusEffect(
        useCallback(() => {
            reload();
        }, [reload]),
    );

    function showComingSoon(title: string, message: string) {
        Alert.alert(title, message);
    }

    function renderContent() {
        if (isLoading) {
            return <ActivityIndicator color={colors.primary} />;
        }

        if (!goal) {
            return (
                <EmptyState
                    title="Caixinha não encontrada"
                    description="Volte e selecione outra caixinha."
                />
            );
        }

        const isShared = goal.type === 'shared';

        return (
            <>
                {/* Saldo acumulado da Caixinha */}
                <View style={styles.balance}>
                    <Text style={styles.balanceLabel}>Saldo Acumulado</Text>
                    <Text style={styles.balanceValue}>
                        {formatCurrency(goal.accumulatedAmount)}
                    </Text>
                    <Text style={styles.goalName}>{goal.name}</Text>
                </View>

                <SegmentedTabs
                    options={filterOptions}
                    selected={filter}
                    onChange={setFilter}
                />

                {/* Ações */}
                <View style={styles.actions}>
                    <Pressable
                        onPress={() =>
                            showComingSoon(
                                'Baixar extrato',
                                'O download do extrato estará disponível em breve.',
                            )
                        }
                        accessibilityRole="button"
                        style={({ pressed }) => [
                            styles.actionButton,
                            styles.primaryAction,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.primaryActionText}>⤓  Baixar</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setIsFilterPanelOpen((open) => !open)}
                        accessibilityRole="button"
                        aria-expanded={isFilterPanelOpen}
                        accessibilityLabel={
                            hasFilters
                                ? `Filtros, ${activeFilterCount} ativo${activeFilterCount > 1 ? 's' : ''}`
                                : 'Filtros'
                        }
                        style={({ pressed }) => [
                            styles.actionButton,
                            styles.secondaryAction,
                            (hasFilters || isFilterPanelOpen) && styles.secondaryActionActive,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.secondaryActionText}>
                            {hasFilters ? `☰  Filtros · ${activeFilterCount}` : '☰  Filtros'}
                        </Text>
                    </Pressable>
                </View>

                {/* Painel de filtros (MGO-08) */}
                {isFilterPanelOpen && (
                    <View style={styles.filterPanel}>
                        <View style={styles.filterHeader}>
                            <Text style={styles.filterTitle}>Período</Text>
                            <Text style={styles.filterCount}>
                                Filtros · {activeFilterCount}
                            </Text>
                        </View>

                        <View style={styles.chipRow}>
                            {periodOptions.map((option) => (
                                <FilterChip
                                    key={option.value}
                                    label={option.label}
                                    selected={period === option.value}
                                    onPress={() => setPeriod(option.value)}
                                />
                            ))}
                        </View>

                        {/* Só nas compartilhadas, com os membros da Caixinha */}
                        {isShared && memberOptions.length > 0 && (
                            <>
                                <Text style={styles.filterTitle}>Membro</Text>

                                <View style={styles.chipRow}>
                                    <FilterChip
                                        label="Todos"
                                        selected={memberName === null}
                                        onPress={() => setMemberName(null)}
                                    />
                                    {memberOptions.map((name) => (
                                        <FilterChip
                                            key={name}
                                            label={name}
                                            selected={memberName === name}
                                            onPress={() => setMemberName(name)}
                                        />
                                    ))}
                                </View>
                            </>
                        )}

                        <Pressable
                            onPress={clearFilters}
                            disabled={!hasFilters}
                            accessibilityRole="button"
                            hitSlop={spacing.sm}
                            style={({ pressed }) => [
                                styles.clearLink,
                                !hasFilters && styles.clearLinkDisabled,
                                pressed && styles.pressed,
                            ]}
                        >
                            <Text style={styles.clearLinkText}>↺  Limpar filtros</Text>
                        </Pressable>
                    </View>
                )}

                {/* Resumo dos filtros ativos com o painel fechado */}
                {!isFilterPanelOpen && hasFilters && (
                    <View style={styles.summaryRow}>
                        {period !== 'all' && (
                            <Pressable
                                onPress={() => setPeriod('all')}
                                accessibilityRole="button"
                                accessibilityLabel={`Remover filtro de período: ${periodLabels[period]}`}
                                style={({ pressed }) => [styles.summaryChip, pressed && styles.pressed]}
                            >
                                <Text style={styles.summaryText} numberOfLines={1}>
                                    Período: {periodLabels[period]}
                                </Text>
                                <Text style={styles.summaryRemove}>✕</Text>
                            </Pressable>
                        )}

                        {memberName && (
                            <Pressable
                                onPress={() => setMemberName(null)}
                                accessibilityRole="button"
                                accessibilityLabel={`Remover filtro de membro: ${memberName}`}
                                style={({ pressed }) => [styles.summaryChip, pressed && styles.pressed]}
                            >
                                <Text style={styles.summaryText} numberOfLines={1}>
                                    Membro: {memberName}
                                </Text>
                                <Text style={styles.summaryRemove}>✕</Text>
                            </Pressable>
                        )}
                    </View>
                )}

                {/* Registros agrupados por dia */}
                {sections.length === 0 && hasFilters ? (
                    <View style={styles.emptyFiltered}>
                        <EmptyState
                            title="Nenhum registro encontrado"
                            description="Nenhum movimento corresponde aos filtros selecionados."
                        />

                        <Pressable
                            onPress={clearFilters}
                            accessibilityRole="button"
                            style={({ pressed }) => [
                                styles.actionButton,
                                styles.secondaryAction,
                                styles.clearButton,
                                pressed && styles.pressed,
                            ]}
                        >
                            <Text style={styles.secondaryActionText}>↺  Limpar filtros</Text>
                        </Pressable>
                    </View>
                ) : sections.length === 0 ? (
                    <EmptyState
                        title="Sem registros"
                        description={emptyMessages[filter]}
                    />
                ) : (
                    sections.map((section) => (
                        <View key={section.key} style={styles.section}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>

                            <View style={styles.card}>
                                {section.records.map((record, index) => (
                                    <View key={record.id}>
                                        {index > 0 && <View style={styles.divider} />}
                                        <GoalRecordItem
                                            record={record}
                                            variant={isShared ? 'contribution' : 'history'}
                                            dateFormat="time"
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))
                )}
            </>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <DetailsHeader
                title="Todos os registros"
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

    balance: {
        alignItems: 'center',
        gap: spacing.xxs,
    },

    balanceLabel: {
        ...typography.caption,
        color: colors.text.secondary,
    },

    balanceValue: {
        ...typography.heading,
        color: colors.text.primary,
    },

    goalName: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    actions: {
        flexDirection: 'row',
        gap: spacing.md,
    },

    actionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.md,
        paddingVertical: spacing.md,
    },

    primaryAction: {
        backgroundColor: colors.primary,
    },

    primaryActionText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.inverse,
    },

    secondaryAction: {
        backgroundColor: goalColors.primaryTint,
    },

    secondaryActionText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.primary,
    },

    secondaryActionActive: {
        borderWidth: 1.5,
        borderColor: colors.primary,
    },

    filterPanel: {
        backgroundColor: colors.surface.primary,
        borderRadius: radius.lg,
        padding: spacing.md,
        gap: spacing.sm,
        ...shadows.sm,
    },

    filterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    filterTitle: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    filterCount: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },

    // Quebra de linha em telas estreitas, sem rolagem horizontal.
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },

    chip: {
        flexGrow: 1,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.full,
        backgroundColor: goalColors.primaryTint,
        paddingHorizontal: spacing.sm,
    },

    chipSelected: {
        backgroundColor: colors.primary,
    },

    chipText: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.primary,
    },

    chipTextSelected: {
        fontFamily: fontFamily.semiBold,
        color: colors.text.inverse,
    },

    clearLink: {
        alignSelf: 'flex-start',
        minHeight: 44,
        justifyContent: 'center',
    },

    clearLinkDisabled: {
        opacity: 0.5,
    },

    clearLinkText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },

    summaryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },

    summaryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: 44,
        maxWidth: '100%',
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.border.default,
        backgroundColor: colors.surface.primary,
        paddingHorizontal: spacing.md,
    },

    summaryText: {
        flexShrink: 1,
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xs,
        color: colors.text.primary,
    },

    summaryRemove: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },

    emptyFiltered: {
        gap: spacing.md,
    },

    clearButton: {
        flex: 0,
        minHeight: 48,
    },

    section: {
        gap: spacing.sm,
    },

    sectionTitle: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        paddingHorizontal: spacing.xs,
    },

    card: {
        backgroundColor: colors.surface.primary,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
        ...shadows.sm,
    },

    divider: {
        height: 1,
        backgroundColor: colors.border.subtle,
    },
});
