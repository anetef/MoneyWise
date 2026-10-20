import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

import type { MainStackParamList } from '../../../../core/navigation/types';
import { colors, spacing } from '../../../../core/theme';

import { DetailsHeader } from '../components/DetailsHeader';
import { EmptyState } from '../components/EmptyState';
import { IndividualGoalDetails } from '../components/IndividualGoalDetails';
import { SharedGoalDetails } from '../components/SharedGoalDetails';
import { useGoalDetails } from '../viewmodels/useGoalDetails';

type Props = NativeStackScreenProps<MainStackParamList, 'GoalDetails'>;

/**
 * Detalhes da Caixinha.
 *
 * Uma única tela que exibe o conteúdo
 * conforme o tipo da Caixinha.
 */
export function GoalDetailsScreen({ navigation, route }: Props) {
    const { goal, isLoading, reload } = useGoalDetails(route.params.goalId);

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
                    description="Volte para a lista e selecione outra caixinha."
                />
            );
        }

        const openSettings = () =>
            navigation.navigate('GoalSettings', { goalId: goal.id });

        const seeAllRecords = () =>
            navigation.navigate('GoalStatement', { goalId: goal.id });

        // Aporte na compartilhada e entrada na individual usam a mesma tela.
        const registerContribution = () =>
            navigation.navigate('GoalContribution', { goalId: goal.id });

        if (goal.type === 'shared') {
            const inviteMembers = () =>
                navigation.navigate('InviteMembers', { groupId: goal.groupId });

            return (
                <SharedGoalDetails
                    goal={goal}
                    onRegisterContribution={registerContribution}
                    onShare={inviteMembers}
                    onInvite={inviteMembers}
                    onOpenSettings={openSettings}
                    onSeeAllRecords={seeAllRecords}
                />
            );
        }

        return (
            <IndividualGoalDetails
                goal={goal}
                onRegisterDeposit={registerContribution}
                onRegisterWithdrawal={() =>
                    showComingSoon(
                        'Registrar retirada',
                        'O registro de retiradas estará disponível em breve.',
                    )
                }
                onOpenSettings={openSettings}
                onSeeAllRecords={seeAllRecords}
            />
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <DetailsHeader
                title="Detalhes da Caixinha"
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                <View style={styles.content}>{renderContent()}</View>
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
    },

    content: {
        gap: spacing.xl,
    },
});
