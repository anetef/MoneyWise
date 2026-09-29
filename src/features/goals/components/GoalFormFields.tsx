import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppText, SettingRow, SettingsSection, Toggle } from '@/core/components';
import { colors, fonts, radius, shadows, spacing } from '@/core/theme';
import { maskCurrencyInput } from '@/core/utils/format';
import { formatShortDate, goalCategories, goalIcons } from '../goalOptions';
import type { GoalIcon } from '../types';

export type GoalFormState = {
  name: string;
  icon: GoalIcon;
  targetText: string;
  deadline: Date;
  noDeadline: boolean;
  categoryLabel: string;
  milestoneAlerts: boolean;
  monthlyReminder: boolean;
};

export function defaultGoalForm(): GoalFormState {
  const inSixMonths = new Date();
  inSixMonths.setMonth(inSixMonths.getMonth() + 6);
  return {
    name: '',
    icon: 'piggy-bank-outline',
    targetText: '',
    deadline: inSixMonths,
    noDeadline: false,
    categoryLabel: goalCategories[0]!,
    milestoneAlerts: true,
    monthlyReminder: true,
  };
}

/** Cabeçalho com o ícone grande da caixinha e o campo de nome. */
export function GoalIdentity({
  form,
  onChange,
  editable = true,
}: {
  form: GoalFormState;
  onChange: (patch: Partial<GoalFormState>) => void;
  editable?: boolean;
}) {
  const [picking, setPicking] = useState(false);
  return (
    <View style={styles.identity}>
      <Pressable
        disabled={!editable}
        onPress={() => setPicking((p) => !p)}
        accessibilityRole="button"
        accessibilityLabel="Escolher ícone"
        style={[styles.bigIcon, shadows.raised]}
      >
        <MaterialCommunityIcons name={form.icon} size={44} color={colors.white} />
        {editable && (
          <View style={styles.camera}>
            <MaterialIcons name="edit" size={14} color={colors.primary} />
          </View>
        )}
      </Pressable>
      {picking && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconRow}>
          {goalIcons.map((icon) => (
            <Pressable
              key={icon}
              onPress={() => {
                onChange({ icon });
                setPicking(false);
              }}
              style={[styles.iconOption, icon === form.icon && styles.iconOptionActive]}
              accessibilityLabel={`Ícone ${icon}`}
            >
              <MaterialCommunityIcons name={icon} size={22} color={icon === form.icon ? colors.white : colors.primary} />
            </Pressable>
          ))}
        </ScrollView>
      )}
      <View style={styles.nameRow}>
        <TextInput
          value={form.name}
          onChangeText={(name) => onChange({ name })}
          placeholder="Nome da caixinha"
          placeholderTextColor={colors.textMuted}
          editable={editable}
          accessibilityLabel="Nome da caixinha"
          style={styles.nameInput}
          maxLength={40}
        />
        {editable && <MaterialIcons name="edit" size={16} color={colors.textMuted} />}
      </View>
      <AppText variant="caption" color="textMuted" align="center">
        Escolha um ícone e um nome para identificar seu objetivo facilmente.
      </AppText>
    </View>
  );
}

/** Seções "Identificação & Objetivo", "Regras" e "Lembretes" (Nova Caixinha e Configurações). */
export function GoalFormSections({
  form,
  onChange,
  editable = true,
  children,
}: {
  form: GoalFormState;
  onChange: (patch: Partial<GoalFormState>) => void;
  editable?: boolean;
  children?: React.ReactNode;
}) {
  const [showCategories, setShowCategories] = useState(false);

  function shiftMonth(delta: number) {
    const next = new Date(form.deadline);
    next.setMonth(next.getMonth() + delta);
    if (next <= new Date()) return;
    onChange({ deadline: next });
  }

  return (
    <>
      <SettingsSection title="Identificação & Objetivo" aside="Planejamento">
        <SettingRow
          icon="flag-outline"
          label="Valor Objetivo"
          right={
            <View style={styles.moneyInputWrap}>
              <AppText variant="headline" color="primary">
                R$
              </AppText>
              <TextInput
                value={form.targetText}
                onChangeText={(t) => onChange({ targetText: maskCurrencyInput(t) })}
                placeholder="0,00"
                placeholderTextColor={colors.primaryMuted}
                keyboardType="decimal-pad"
                editable={editable}
                accessibilityLabel="Valor objetivo"
                style={styles.moneyInput}
              />
            </View>
          }
        />
        {!form.noDeadline && (
          <SettingRow
            icon="calendar-month-outline"
            label="Data Limite Estimada"
            right={
              <View style={styles.dateStepper}>
                {editable && (
                  <Pressable onPress={() => shiftMonth(-1)} hitSlop={8} accessibilityLabel="Mês anterior">
                    <MaterialIcons name="chevron-left" size={22} color={colors.textMuted} />
                  </Pressable>
                )}
                <AppText variant="headline">{formatShortDate(form.deadline)}</AppText>
                {editable && (
                  <Pressable onPress={() => shiftMonth(1)} hitSlop={8} accessibilityLabel="Próximo mês">
                    <MaterialIcons name="chevron-right" size={22} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
            }
          />
        )}
        <SettingRow
          label="Meta sem prazo fixo"
          description="Guardar livremente no seu próprio ritmo"
          right={
            <Toggle
              value={form.noDeadline}
              onValueChange={(noDeadline) => editable && onChange({ noDeadline })}
              accessibilityLabel="Meta sem prazo fixo"
            />
          }
        />
        <SettingRow
          icon="shape-outline"
          label="Categoria"
          onPress={editable ? () => setShowCategories((s) => !s) : undefined}
          right={
            <View style={styles.categoryValue}>
              <View style={styles.categoryDot} />
              <AppText variant="headline" color="primary" numberOfLines={1} style={{ maxWidth: 170 }}>
                {form.categoryLabel}
              </AppText>
              <MaterialIcons name={showCategories ? 'expand-less' : 'chevron-right'} size={20} color={colors.primary} />
            </View>
          }
        >
          {showCategories && (
            <View style={styles.chips}>
              {goalCategories.map((c) => {
                const active = c === form.categoryLabel;
                return (
                  <Pressable
                    key={c}
                    onPress={() => {
                      onChange({ categoryLabel: c });
                      setShowCategories(false);
                    }}
                    style={[styles.chip, active && { backgroundColor: colors.primary }]}
                  >
                    <AppText variant="footnote" style={{ color: active ? colors.white : colors.textMuted }}>
                      {c}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </SettingRow>
      </SettingsSection>

      {children}

      <SettingsSection title="Rotina & Lembretes" aside={<AppText variant="caption" color="primary">Controle Pessoal</AppText>}>
        <SettingRow
          icon="bell-ring-outline"
          label="Lembrete Mensal"
          description="Aviso no smartphone para registrar economia"
          right={
            <Toggle
              value={form.monthlyReminder}
              onValueChange={(monthlyReminder) => editable && onChange({ monthlyReminder })}
              accessibilityLabel="Lembrete mensal"
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Regras de Gestão & Foco">
        <SettingRow
          icon="trophy-outline"
          label="Marcos de Conquista"
          description="Feedback motivador a cada 25% completado"
          right={
            <Toggle
              value={form.milestoneAlerts}
              onValueChange={(milestoneAlerts) => editable && onChange({ milestoneAlerts })}
              accessibilityLabel="Marcos de conquista"
            />
          }
        />
      </SettingsSection>
    </>
  );
}

/** Aviso do rodapé do Figma (o app não movimenta dinheiro de verdade). */
export function GoalDisclaimer() {
  return (
    <View style={styles.disclaimer}>
      <MaterialIcons name="info-outline" size={16} color={colors.textMuted} />
      <AppText variant="caption" color="textMuted" style={{ flex: 1 }}>
        Este aplicativo realiza estritamente a gestão visual e o planejamento colaborativo de metas. Não
        custodia valores financeiros nem transaciona dinheiro real entre contas bancárias.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: 'center', gap: spacing.sm },
  bigIcon: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    position: 'absolute',
    right: -2,
    bottom: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  iconRow: { gap: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: 4 },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOptionActive: { backgroundColor: colors.primary },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  nameInput: {
    fontFamily: fonts.medium,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    minWidth: 180,
    paddingVertical: 4,
    outlineStyle: 'none',
  } as object,
  moneyInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moneyInput: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.primary,
    textAlign: 'right',
    minWidth: 70,
    maxWidth: 130,
    padding: 0,
    outlineStyle: 'none',
  } as object,
  dateStepper: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  categoryValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.chip },
  disclaimer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#F2EDEA',
  },
});
