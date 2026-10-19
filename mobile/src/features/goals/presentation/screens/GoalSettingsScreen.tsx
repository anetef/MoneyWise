import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
} from 'react-native';

import type { MainStackParamList } from '../../../../core/navigation/types';
import { colors, spacing } from '../../../../core/theme';

import { DetailsHeader } from '../components/DetailsHeader';
import { EmptyState } from '../components/EmptyState';
import { IndividualGoalSettings } from '../components/IndividualGoalSettings';
import { useGoalSettings } from '../viewmodels/useGoalSettings';

type Props = NativeStackScreenProps<MainStackParamList, 'GoalSettings'>;

/**
 * Configurações da Caixinha (MGO-09).
 *
 * Uma única tela que exibe o conteúdo conforme o tipo.
 * Nesta etapa, apenas a Caixinha individual está disponível.
 */
export function GoalSettingsScreen({ navigation, route }: Props) {
    const {
        goal,
        isLoading,
        name,
        amountText,
        deadlineText,
        errors,
        isSaving,
        changeName,
        changeAmount,
        changeDeadline,
        save,
    } = useGoalSettings(route.params.goalId);

    const canSave = !!goal && goal.type === 'individual';

    async function handleSave() {
        if (await save()) {
            navigation.goBack();
        }
    }

    // Arquivar e excluir dependem de L-09: não alteram nenhum dado.
    function showComingSoon(title: string) {
        Alert.alert(title, 'Esta ação estará disponível em breve.');
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

        // As Configurações da Caixinha compartilhada entram na próxima entrega.
        if (goal.type === 'shared') {
            return (
                <EmptyState
                    title={goal.name}
                    description="As configurações de caixinhas compartilhadas estarão disponíveis em breve."
                />
            );
        }

        return (
            <IndividualGoalSettings
                goal={goal}
                name={name}
                amountText={amountText}
                deadlineText={deadlineText}
                errors={errors}
                onChangeName={changeName}
                onChangeAmount={changeAmount}
                onChangeDeadline={changeDeadline}
                onArchive={() => showComingSoon('Arquivar Caixinha')}
                onDelete={() => showComingSoon('Excluir Meta Cadastrada')}
            />
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <DetailsHeader
                title="Configurações da Caixinha"
                onBack={() => navigation.goBack()}
                action={
                    canSave
                        ? { label: 'Salvar', onPress: handleSave, disabled: isSaving }
                        : undefined
                }
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
        padding: spacing.xl,
        paddingBottom: spacing.massive,
    },
});
