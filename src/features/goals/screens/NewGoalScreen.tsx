import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, SegmentedControl } from '@/core/components';
import { routes } from '@/core/navigation/routes';
import { colors, radius, shadows, spacing } from '@/core/theme';
import { getErrorMessage } from '@/core/utils/errors';
import { showMessage } from '@/core/utils/feedback';
import { parseCurrencyInput } from '@/core/utils/format';
import {
  defaultGoalForm,
  GoalDisclaimer,
  GoalFormSections,
  GoalIdentity,
  type GoalFormState,
} from '../components/GoalFormFields';
import { useGoals } from '../useGoals';

/** Figma: "Nova Caixinha - Criar" — RF-11 */
export function NewGoalScreen() {
  const params = useLocalSearchParams<{ shared?: string }>();
  const { create } = useGoals();
  const [form, setForm] = useState<GoalFormState>(defaultGoalForm);
  const [shared, setShared] = useState(params.shared === '1');
  const [saving, setSaving] = useState(false);
  const patch = (p: Partial<GoalFormState>) => setForm((f) => ({ ...f, ...p }));

  async function handleCreate() {
    setSaving(true);
    try {
      const id = await create({
        name: form.name,
        icon: form.icon,
        categoryLabel: form.categoryLabel,
        targetAmount: parseCurrencyInput(form.targetText),
        deadline: form.noDeadline ? null : form.deadline,
        shared,
        milestoneAlerts: form.milestoneAlerts,
        monthlyReminder: form.monthlyReminder,
      });
      // Caixinha compartilhada: já leva para convidar os membros.
      router.replace(shared ? routes.goalInvite(id) : routes.goalDetails(id));
    } catch (e) {
      showMessage('Não foi possível criar', getErrorMessage(e));
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button">
          <AppText variant="bodyLarge" color="primary">
            Cancelar
          </AppText>
        </Pressable>
        <AppText variant="title" style={{ fontFamily: 'Inter_700Bold' }}>
          Nova Caixinha
        </AppText>
        <Pressable onPress={handleCreate} disabled={saving} hitSlop={10} accessibilityRole="button">
          <AppText variant="headline" color="primary" style={{ fontSize: 17 }}>
            Criar
          </AppText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <GoalIdentity form={form} onChange={patch} />

        <SegmentedControl<'individual' | 'shared'>
          value={shared ? 'shared' : 'individual'}
          onChange={(v) => setShared(v === 'shared')}
          options={[
            { value: 'individual', label: 'Individual' },
            { value: 'shared', label: 'Compartilhada' },
          ]}
        />

        <GoalFormSections form={form} onChange={patch} />

        <Pressable
          accessibilityRole="button"
          onPress={handleCreate}
          disabled={saving}
          style={({ pressed }) => [styles.create, shadows.raised, (pressed || saving) && { opacity: 0.85 }]}
          testID="create-goal"
        >
          <MaterialIcons name="add-circle-outline" size={20} color={colors.white} />
          <AppText variant="button" style={{ color: colors.white }}>
            {saving ? 'Criando…' : 'Criar Caixinha'}
          </AppText>
        </Pressable>

        <GoalDisclaimer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  create: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
