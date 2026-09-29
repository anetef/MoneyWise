import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Avatar, SettingRow, SettingsSection, TopBar } from '@/core/components';
import { routes } from '@/core/navigation/routes';
import { colors, radius, spacing } from '@/core/theme';
import { getErrorMessage } from '@/core/utils/errors';
import { confirmAction, showMessage } from '@/core/utils/feedback';
import { formatCurrency, maskCurrencyInput, parseCurrencyInput } from '@/core/utils/format';
import { useCurrentUser } from '@/features/auth/AuthContext';
import {
  defaultGoalForm,
  GoalDisclaimer,
  GoalFormSections,
  GoalIdentity,
  type GoalFormState,
} from '../components/GoalFormFields';
import { useGoal } from '../useGoals';

/**
 * Figma: "Caixinha - Configurações (Individual)" e "(Compartilhada)".
 * RN-04: só o Admin altera a meta, remove membros ou exclui a caixinha.
 */
export function GoalSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useCurrentUser();
  const { goal, isAdmin, update, removeMember, remove, leave } = useGoal(id);
  const [form, setForm] = useState<GoalFormState>(defaultGoalForm);
  const [saving, setSaving] = useState(false);
  const patch = (p: Partial<GoalFormState>) => setForm((f) => ({ ...f, ...p }));
  const canEdit = !!goal && (!goal.shared || isAdmin);

  useEffect(() => {
    if (!goal) return;
    setForm({
      name: goal.name,
      icon: goal.icon,
      targetText: maskCurrencyInput(String(Math.round(goal.targetAmount * 100))),
      deadline: goal.deadline ?? defaultGoalForm().deadline,
      noDeadline: !goal.deadline,
      categoryLabel: goal.categoryLabel || defaultGoalForm().categoryLabel,
      milestoneAlerts: goal.milestoneAlerts,
      monthlyReminder: goal.monthlyReminder,
    });
    // Só preenche ao abrir (ou quando outra pessoa alterar a caixinha).
  }, [goal?.id, goal?.targetAmount, goal?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!goal) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopBar title="Configurações da Caixinha" backColor={colors.primary} />
      </SafeAreaView>
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await update({
        name: form.name.trim(),
        icon: form.icon,
        categoryLabel: form.categoryLabel,
        targetAmount: parseCurrencyInput(form.targetText),
        deadline: form.noDeadline ? null : form.deadline,
        milestoneAlerts: form.milestoneAlerts,
        monthlyReminder: form.monthlyReminder,
      });
      router.back();
    } catch (e) {
      showMessage('Não foi possível salvar', getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveMember(memberId: string, name: string) {
    const ok = await confirmAction('Remover membro', `Remover ${name} desta caixinha?`, 'Remover');
    if (!ok) return;
    try {
      await removeMember(memberId);
    } catch (e) {
      showMessage('Não foi possível remover', getErrorMessage(e));
    }
  }

  async function handleLeave() {
    const ok = await confirmAction('Sair da caixinha', 'Você deixará de ver esta caixinha.', 'Sair');
    if (!ok) return;
    try {
      await leave();
      router.dismissTo(routes.goals);
    } catch (e) {
      showMessage('Não foi possível sair', getErrorMessage(e));
    }
  }

  async function handleDelete() {
    const ok = await confirmAction(
      'Excluir caixinha',
      'A caixinha e o histórico deixam de aparecer para todos os membros.',
      'Excluir',
    );
    if (!ok) return;
    try {
      await remove();
      router.dismissTo(routes.goals);
    } catch (e) {
      showMessage('Não foi possível excluir', getErrorMessage(e));
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar
        title="Configurações da Caixinha"
        backColor={colors.primary}
        right={
          canEdit ? (
            <Pressable onPress={handleSave} disabled={saving} hitSlop={10} accessibilityRole="button">
              <AppText variant="headline" color="primary" style={{ fontSize: 16 }}>
                {saving ? 'Salvando…' : 'Salvar'}
              </AppText>
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <GoalIdentity form={form} onChange={patch} editable={canEdit} />

        {!canEdit && (
          <View style={styles.notice}>
            <MaterialIcons name="lock-outline" size={16} color={colors.primary} />
            <AppText variant="footnote" color="textMuted" style={{ flex: 1 }}>
              Somente o administrador pode alterar esta caixinha.
            </AppText>
          </View>
        )}

        <GoalFormSections form={form} onChange={patch} editable={canEdit}>
          {goal.shared && (
            <SettingsSection
              title={`Membros da caixinha (${goal.members.length})`}
              aside={
                isAdmin ? (
                  <Pressable onPress={() => router.push(routes.goalInvite(goal.id))} hitSlop={8} style={styles.inviteLink}>
                    <MaterialIcons name="person-add-alt" size={16} color={colors.primary} />
                    <AppText variant="caption" color="primary">
                      Convidar
                    </AppText>
                  </Pressable>
                ) : undefined
              }
            >
              {goal.members.map((m) => (
                <View key={m.id} style={styles.memberRow}>
                  <Avatar name={m.name} size={40} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.inline}>
                      <AppText variant="bodyLarge" numberOfLines={1}>
                        {m.name}
                        {m.id === user.id ? ' (Você)' : ''}
                      </AppText>
                      <View style={[styles.role, m.role === 'admin' && styles.roleAdmin]}>
                        <AppText
                          variant="label"
                          style={{ color: m.role === 'admin' ? colors.white : colors.textMuted, fontSize: 10 }}
                        >
                          {m.role === 'admin' ? 'CRIADOR' : 'Membro'}
                        </AppText>
                      </View>
                    </View>
                    <AppText variant="caption" color="textMuted">
                      Registrou: {formatCurrency(m.contributed)}
                    </AppText>
                  </View>
                  {isAdmin && m.role !== 'admin' && (
                    <Pressable
                      onPress={() => handleRemoveMember(m.id, m.name)}
                      hitSlop={10}
                      accessibilityLabel={`Remover ${m.name}`}
                    >
                      <MaterialIcons name="more-vert" size={22} color={colors.textMuted} />
                    </Pressable>
                  )}
                </View>
              ))}
            </SettingsSection>
          )}
        </GoalFormSections>

        <SettingsSection>
          {goal.shared && !isAdmin ? (
            <SettingRow icon="logout" label="Sair desta Caixinha" onPress={handleLeave} chevron />
          ) : (
            <SettingRow icon="delete-outline" label="Excluir Caixinha" danger onPress={handleDelete} chevron />
          )}
        </SettingsSection>

        <GoalDisclaimer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  inviteLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  role: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, backgroundColor: colors.chip },
  roleAdmin: { backgroundColor: colors.primary },
});
