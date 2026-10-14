import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
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
} from '../viewmodels/useGoalStatement';

type Props = NativeStackScreenProps<MainStackParamList, 'GoalStatement'>;

const filterOptions: { value: StatementFilter; label: string }[] = [
    { value: 'all', label: 'Tudo' },
    { value: 'deposit', label: 'Entradas' },
    { value: 'withdrawal', label: 'Saídas' },
];

const emptyMessages: Record<StatementFilter, string> = {
    all: 'Nenhum registro nesta caixinha ainda.',
    deposit: 'Nenhuma entrada registrada.',
    withdrawal: 'Nenhuma saída registrada.',
};

/**
 * Extrato da Caixinha ("Todos os registros").
 *
 * Lista somente os movimentos da Caixinha, agrupados
 * por dia; nunca transações pessoais (RN02).
 */
export function GoalStatementScreen({ navigation, route }: Props) {
    const {
        goal,
        sections,
        filter,
        setFilter,
        isLoading,
        reload,
    } = useGoalStatement(route.params.goalId);

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
                        onPress={() =>
                            showComingSoon(
                                'Filtros',
                                'Filtros adicionais estarão disponíveis em breve. Use as abas Tudo, Entradas e Saídas.',
                            )
                        }
                        accessibilityRole="button"
                        style={({ pressed }) => [
                            styles.actionButton,
                            styles.secondaryAction,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.secondaryActionText}>☰  Filtros</Text>
                    </Pressable>
                </View>

                {/* Registros agrupados por dia */}
                {sections.length === 0 ? (
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
