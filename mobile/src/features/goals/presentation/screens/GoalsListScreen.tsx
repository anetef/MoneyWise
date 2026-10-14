import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
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

import type {
    MainStackParamList,
    MainTabsParamList,
} from '../../../../core/navigation/types';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    spacing,
    typography,
} from '../../../../core/theme';

import type { Goal, GoalType } from '../../domain/Goal';
import { EmptyState } from '../components/EmptyState';
import { GoalCard } from '../components/GoalCard';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { useGoalsList } from '../viewmodels/useGoalsList';

type Props = CompositeScreenProps<
    BottomTabScreenProps<MainTabsParamList, 'Goals'>,
    NativeStackScreenProps<MainStackParamList>
>;

const tabOptions: { value: GoalType; label: string }[] = [
    { value: 'individual', label: 'Individuais' },
    { value: 'shared', label: 'Compartilhadas' },
];

const emptyMessages: Record<GoalType, { title: string; description: string }> = {
    individual: {
        title: 'Nenhuma caixinha individual',
        description: 'Crie uma caixinha para guardar dinheiro para seus objetivos pessoais.',
    },
    shared: {
        title: 'Nenhuma caixinha compartilhada',
        description: 'Crie uma caixinha compartilhada e convide pessoas para juntar dinheiro com você.',
    },
};

export function GoalsListScreen(_props: Props) {
    const {
        visibleGoals,
        selectedType,
        setSelectedType,
        isLoading,
    } = useGoalsList();

    function openGoalDetails(goal: Goal) {
        Alert.alert(
            goal.name,
            'A tela de detalhes será conectada na próxima etapa.',
        );
    }

    function openCreateGoal() {
        Alert.alert(
            'Nova Caixinha',
            'A tela de criação será conectada na próxima etapa.',
        );
    }

    return (
        <SafeAreaView style={styles.screen} edges={['top']}>
            {/* Cabeçalho */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Caixinhas</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                <SegmentedTabs
                    options={tabOptions}
                    selected={selectedType}
                    onChange={setSelectedType}
                />

                {/* Lista de Caixinhas */}
                <View style={styles.list}>
                    {isLoading ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : visibleGoals.length === 0 ? (
                        <EmptyState {...emptyMessages[selectedType]} />
                    ) : (
                        visibleGoals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onPress={() => openGoalDetails(goal)}
                            />
                        ))
                    )}
                </View>

                {/* Nova Caixinha */}
                <Pressable
                    accessibilityRole="button"
                    onPress={openCreateGoal}
                    style={({ pressed }) => [
                        styles.createButton,
                        pressed && styles.createButtonPressed,
                    ]}
                >
                    <Text style={styles.createButtonIcon}>⊕</Text>
                    <Text style={styles.createButtonText}>Nova Caixinha</Text>
                </Pressable>

                <Text style={styles.helperText}>
                    Guarde dinheiro de forma organizada para alcançar seus
                    objetivos mais rápido.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },

    header: {
        backgroundColor: colors.surface.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.subtle,
    },

    headerTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.primary,
    },

    container: {
        padding: spacing.xl,
        paddingBottom: spacing.massive,
        gap: spacing.xl,
    },

    list: {
        gap: spacing.xl,
    },

    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: spacing.lg,
        marginTop: spacing.sm,
    },

    createButtonPressed: {
        opacity: 0.85,
    },

    createButtonIcon: {
        fontSize: fontSize.lg,
        color: colors.text.inverse,
    },

    createButtonText: {
        ...typography.button,
        color: colors.text.inverse,
    },

    helperText: {
        ...typography.caption,
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
    },
});
