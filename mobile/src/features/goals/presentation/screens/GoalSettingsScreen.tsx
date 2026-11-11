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
import type { GoalMember } from '../../domain/Goal';
import { colors, spacing } from '../../../../core/theme';

import { DetailsHeader } from '../components/DetailsHeader';
import { EmptyState } from '../components/EmptyState';
import { IndividualGoalSettings } from '../components/IndividualGoalSettings';
import { SharedGoalSettings } from '../components/SharedGoalSettings';
import {
    useGoalSettings,
    type SettingsActionResult,
} from '../viewmodels/useGoalSettings';

type Props = NativeStackScreenProps<MainStackParamList, 'GoalSettings'>;

/**
 * Configurações da Caixinha (MGO-09).
 *
 * Uma única tela que exibe o conteúdo conforme o tipo.
 *
 * A tela não aplica regras de permissão: quem pode editar a
 * meta ou gerenciar membros (RN04, L-10, L-17) é validado
 * pelo backend, e a mensagem de erro dele é mostrada.
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
        archive,
        remove,
        leave,
        removeMember,
    } = useGoalSettings(route.params.goalId);

    const canSave = !!goal;

    /** Mostra o erro da API, se houver; devolve true quando deu certo. */
    function handleResult(result: SettingsActionResult): boolean {
        if (!result.ok && result.message) {
            Alert.alert('Não deu certo', result.message);
        }

        return result.ok;
    }

    async function handleSave() {
        if (handleResult(await save())) {
            navigation.goBack();
        }
    }

    /** Pede confirmação e, se der certo, volta para a lista de Caixinhas. */
    function confirmAndLeave(
        title: string,
        message: string,
        confirmLabel: string,
        action: () => Promise<SettingsActionResult>,
    ) {
        Alert.alert(title, message, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: confirmLabel,
                style: 'destructive',
                onPress: async () => {
                    if (handleResult(await action())) {
                        navigation.popTo('MainTabs', { screen: 'Goals' });
                    }
                },
            },
        ]);
    }

    function handleArchive() {
        confirmAndLeave(
            'Arquivar Caixinha?',
            'Ela sai da sua lista, mas o histórico e o valor guardado continuam salvos.',
            'Arquivar',
            archive,
        );
    }

    function handleDelete() {
        confirmAndLeave(
            'Excluir Caixinha?',
            'A Caixinha e todo o histórico serão apagados. Essa ação não pode ser desfeita.',
            'Excluir',
            remove,
        );
    }

    function handleLeave() {
        confirmAndLeave(
            'Sair desta Caixinha?',
            'Você deixa de ver a Caixinha e os registros dela. Para voltar, vai precisar de um novo convite.',
            'Sair',
            leave,
        );
    }

    /** Pede confirmação e remove o membro; a tela continua aberta. */
    function handleRemoveMember(member: GoalMember) {
        Alert.alert(
            `Remover ${member.name} da Caixinha?`,
            `${member.name} deixa de ver a Caixinha e os registros dela. Os aportes que já fez continuam no total.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        handleResult(await removeMember(member.id));
                    },
                },
            ],
        );
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
                    onLeave={handleLeave}
                    onArchive={handleArchive}
                    onRemoveMember={handleRemoveMember}
                    disabled={isSaving}
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
                onArchive={handleArchive}
                onDelete={handleDelete}
                disabled={isSaving}
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
