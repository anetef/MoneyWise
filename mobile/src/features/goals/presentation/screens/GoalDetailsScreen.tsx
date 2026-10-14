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

        // Os detalhes da Caixinha compartilhada entram na próxima entrega (MGO-05).
        if (goal.type === 'shared') {
            return (
                <EmptyState
                    title={goal.name}
                    description="Os detalhes de caixinhas compartilhadas estarão disponíveis em breve."
                />
            );
        }

        return (
            <IndividualGoalDetails
                goal={goal}
                onRegisterDeposit={() =>
                    showComingSoon(
                        'Registrar entrada',
                        'O registro de entradas estará disponível em breve.',
                    )
                }
                onRegisterWithdrawal={() =>
                    showComingSoon(
                        'Registrar retirada',
                        'O registro de retiradas estará disponível em breve.',
                    )
                }
                onOpenSettings={() =>
                    showComingSoon(
                        'Configurações',
                        'As configurações da caixinha estarão disponíveis em breve.',
                    )
                }
                onSeeAllRecords={() =>
                    showComingSoon(
                        'Todos os registros',
                        'O extrato da caixinha será conectado na próxima etapa.',
                    )
                }
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
