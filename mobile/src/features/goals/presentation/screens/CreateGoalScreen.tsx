import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
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

import type { GoalType } from '../../domain/Goal';
import { DisabledSwitch } from '../components/DisabledSwitch';
import { FormRow } from '../components/FormRow';
import { FormSection } from '../components/FormSection';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { useCreateGoal } from '../viewmodels/useCreateGoal';

type Props = NativeStackScreenProps<MainStackParamList, 'CreateGoal'>;

const typeOptions: { value: GoalType; label: string }[] = [
    { value: 'individual', label: 'Individual' },
    { value: 'shared', label: 'Compartilhada' },
];

export function CreateGoalScreen({ navigation }: Props) {
    const {
        name,
        type,
        amountText,
        deadlineText,
        errors,
        isSubmitting,
        changeName,
        setType,
        changeAmount,
        changeDeadline,
        submit,
    } = useCreateGoal();

    // Os botões "Criar" e "Criar Caixinha" acionam esta mesma operação.
    async function handleCreate() {
        const goal = await submit();

        if (goal) {
            // Fecha o formulário na lista, já na aba do tipo criado, e
            // abre os detalhes por cima dela (MGO-03): o "Voltar" dos
            // detalhes retorna à lista, e não ao formulário.
            navigation.popTo('MainTabs', {
                screen: 'Goals',
                params: { createdGoalType: goal.type },
            });
            navigation.navigate('GoalDetails', { goalId: goal.id });
        }
    }

    const formErrors = [errors.targetAmount, errors.deadline].filter(Boolean);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* Cabeçalho */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                    hitSlop={spacing.sm}
                >
                    <Text style={styles.headerAction}>Cancelar</Text>
                </Pressable>

                <Text style={styles.headerTitle}>Nova Caixinha</Text>

                <Pressable
                    onPress={handleCreate}
                    disabled={isSubmitting}
                    accessibilityRole="button"
                    accessibilityLabel="Criar caixinha"
                    hitSlop={spacing.sm}
                >
                    <Text style={[styles.headerAction, styles.headerActionStrong]}>
                        Criar
                    </Text>
                </Pressable>
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Identidade visual e nome */}
                    <View style={styles.identity}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarIcon}>🐷</Text>

                            {/* Seleção de ícone depende de L-08 */}
                            <View
                                style={styles.cameraBadge}
                                accessibilityLabel="Escolher ícone, em breve"
                            >
                                <Text style={styles.cameraIcon}>📷</Text>
                            </View>
                        </View>

                        <TextInput
                            style={styles.nameInput}
                            placeholder="Nome da caixinha"
                            placeholderTextColor={colors.text.secondary}
                            value={name}
                            onChangeText={changeName}
                            maxLength={60}
                            returnKeyType="next"
                            accessibilityLabel="Nome da caixinha"
                        />

                        {errors.name ? (
                            <Text style={styles.errorText} accessibilityRole="alert">
                                {errors.name}
                            </Text>
                        ) : (
                            <Text style={styles.identityHint}>
                                Escolha uma cor e um ícone para identificar seu
                                objetivo facilmente.
                            </Text>
                        )}
                    </View>

                    <SegmentedTabs
                        options={typeOptions}
                        selected={type}
                        onChange={setType}
                    />

                    {type === 'shared' && (
                        <View style={styles.infoCard}>
                            <Text style={styles.infoText}>
                                Você será o administrador desta caixinha e poderá
                                convidar membros depois de criá-la.
                            </Text>
                        </View>
                    )}

                    {/* Identificação e objetivo */}
                    <View style={styles.sectionGroup}>
                        <FormSection title="Identificação & Objetivo" aside="Planejamento">
                            <FormRow icon="⚑" label="Valor Objetivo">
                                <TextInput
                                    style={styles.amountInput}
                                    placeholder="R$ 0,00"
                                    placeholderTextColor={colors.text.secondary}
                                    value={amountText}
                                    onChangeText={changeAmount}
                                    keyboardType="number-pad"
                                    accessibilityLabel="Valor objetivo"
                                />
                            </FormRow>

                            <FormRow icon="▦" label="Data Limite Estimada">
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="DD/MM/AAAA"
                                    placeholderTextColor={colors.text.secondary}
                                    value={deadlineText}
                                    onChangeText={changeDeadline}
                                    keyboardType="number-pad"
                                    maxLength={10}
                                    accessibilityLabel="Data limite estimada, opcional"
                                />
                            </FormRow>

                            <FormRow
                                label="Meta sem prazo fixo"
                                description="Guardar livremente no seu próprio ritmo"
                                comingSoon
                            >
                                <DisabledSwitch />
                            </FormRow>

                            <FormRow icon="◇" label="Categoria" comingSoon>
                                <Text style={styles.rowValue}>Selecionar ›</Text>
                            </FormRow>
                        </FormSection>

                        {formErrors.map((message) => (
                            <Text
                                key={message}
                                style={styles.errorText}
                                accessibilityRole="alert"
                            >
                                {message}
                            </Text>
                        ))}
                    </View>

                    <FormSection title="Regras de Gestão & Foco">
                        <FormRow
                            icon="♕"
                            label="Marcos de Conquista"
                            description="Feedback motivador a cada 25% completado"
                            comingSoon
                        >
                            <DisabledSwitch />
                        </FormRow>
                    </FormSection>

                    <FormSection
                        title="Rotina & Lembretes"
                        aside={type === 'individual' ? 'Controle Pessoal' : undefined}
                        asideTone="primary"
                    >
                        <FormRow
                            icon="🔔"
                            label="Lembrete Mensal"
                            description="Aviso no smartphone para registrar economia"
                            comingSoon
                        >
                            <DisabledSwitch />
                        </FormRow>
                    </FormSection>

                    <FormSection title="Lembretes & Notificações">
                        <FormRow
                            label="Lembrete mensal de aporte"
                            description="Receba alerta para atualizar o progresso"
                            comingSoon
                        >
                            <DisabledSwitch />
                        </FormRow>
                    </FormSection>

                    {/* Criar */}
                    <Pressable
                        onPress={handleCreate}
                        disabled={isSubmitting}
                        accessibilityRole="button"
                        style={({ pressed }) => [
                            styles.createButton,
                            (pressed || isSubmitting) && styles.pressed,
                        ]}
                    >
                        <Text style={styles.createButtonIcon}>⊕</Text>
                        <Text style={styles.createButtonText}>Criar Caixinha</Text>
                    </Pressable>

                    <Text style={styles.disclaimer}>
                        Este aplicativo realiza estritamente a gestão visual e
                        planejamento colaborativo de metas. Não custodia valores
                        financeiros nem transaciona dinheiro real entre contas
                        bancárias.
                    </Text>
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

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        ...shadows.sm,
    },

    headerTitle: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xl,
        color: colors.text.primary,
    },

    headerAction: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        color: colors.primary,
    },

    headerActionStrong: {
        fontFamily: fontFamily.semiBold,
    },

    container: {
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
        padding: spacing.xl,
        paddingBottom: spacing.massive,
        gap: spacing.xxl,
    },

    identity: {
        alignItems: 'center',
        gap: spacing.sm,
    },

    avatar: {
        width: 96,
        height: 96,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },

    avatarIcon: {
        fontSize: 40,
    },

    cameraBadge: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: colors.surface.primary,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.6,
        ...shadows.sm,
    },

    cameraIcon: {
        fontSize: fontSize.sm,
    },

    nameInput: {
        alignSelf: 'stretch',
        textAlign: 'center',
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        color: colors.text.primary,
        paddingVertical: spacing.xs,
    },

    identityHint: {
        ...typography.caption,
        fontSize: fontSize.xs,
        lineHeight: 16,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: spacing.xxl,
    },

    infoCard: {
        backgroundColor: colors.surface.secondary,
        borderRadius: radius.md,
        padding: spacing.md,
    },

    infoText: {
        ...typography.caption,
        fontSize: fontSize.xs,
        lineHeight: 16,
        color: colors.text.secondary,
    },

    sectionGroup: {
        gap: spacing.sm,
    },

    amountInput: {
        width: 140,
        textAlign: 'right',
        fontFamily: fontFamily.bold,
        fontSize: fontSize.md,
        color: colors.primary,
        paddingVertical: 0,
    },

    dateInput: {
        width: 110,
        textAlign: 'right',
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
        paddingVertical: 0,
    },

    rowValue: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },

    errorText: {
        ...typography.caption,
        fontSize: fontSize.xs,
        color: colors.status.error,
        textAlign: 'center',
    },

    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: spacing.lg,
    },

    pressed: {
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

    disclaimer: {
        ...typography.caption,
        fontSize: fontSize.xs,
        lineHeight: 16,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: spacing.sm,
    },
});
