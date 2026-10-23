import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    ActivityIndicator,
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
import { SharedGoalSettings } from '../components/SharedGoalSettings';
import { useGoalSettings } from '../viewmodels/useGoalSettings';

type Props = NativeStackScreenProps<MainStackParamList, 'GoalSettings'>;

/**
 * Configurações da Caixinha (MGO-09).
 *
 * Uma única tela que exibe o conteúdo conforme o tipo.
 *
 * A tela não aplica regras de permissão: quem pode editar a
 * meta ou gerenciar membros (RN04, L-10, L-17) será validado
 * pelo backend. No mock, o usuário simulado é o Admin.
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

    const canSave = !!goal;

    async function handleSave() {
        if (await save()) {
            navigation.goBack();
        }
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

        if (goal.type === 'shared') {
            return (
                <SharedGoalSettings
                    goal={goal}
                    name={name}
                    amountText={amountText}
                    deadlineText={deadlineText}
                    errors={errors}
                    onChangeName={changeName}
                    onChangeAmount={changeAmount}
                    onChangeDeadline={changeDeadline}
                    onInvite={() =>
                        navigation.navigate('InviteMembers', { groupId: goal.groupId })
                    }
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
