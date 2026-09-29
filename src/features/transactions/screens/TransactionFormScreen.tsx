import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, TopBar } from '@/core/components';
import { colors, fonts, radius, shadows, spacing } from '@/core/theme';
import { getErrorMessage } from '@/core/utils/errors';
import { confirmAction, showMessage } from '@/core/utils/feedback';
import { maskCurrencyInput, parseCurrencyInput } from '@/core/utils/format';
import { categoriesFor } from '../categories';
import type { TransactionType } from '../types';
import { isLocked, useTransactions } from '../useTransactions';

// Paleta própria desta tela no Figma (tons mais quentes).
const palette = {
  background: '#FFF8F6',
  header: '#A0522D',
  selected: '#FFDBD1',
  chip: '#F2E4E0',
  label: '#53433F',
  strong: '#231917',
  divider: '#EDE0DC',
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dateLabel(date: Date) {
  const diff = Math.round((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86_400_000);
  const short = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  const pretty = short.replace(/ de /, ' ').replace(/(\d+) (\w)/, (_, d, m) => `${d} ${m.toUpperCase()}`);
  if (diff === 0) return `Hoje, ${pretty}`;
  if (diff === 1) return `Ontem, ${pretty}`;
  return pretty;
}

/**
 * Figma: "Adicionar Transação" — RF-05 (cadastrar), RF-06 (editar), RF-07 (excluir).
 * Abre em modo edição quando recebe `?id=` na rota.
 */
export function TransactionFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { items, add, update, remove } = useTransactions();
  const editing = useMemo(() => (id ? items.find((t) => t.id === id) : undefined), [id, items]);

  const [type, setType] = useState<TransactionType>('expense');
  const [amountText, setAmountText] = useState('');
  const [categoryId, setCategoryId] = useState('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [saving, setSaving] = useState(false);

  // Preenche o formulário ao editar.
  useEffect(() => {
    if (!editing) return;
    setType(editing.type);
    setAmountText(maskCurrencyInput(String(Math.round(editing.amount * 100))));
    setCategoryId(editing.categoryId);
    setDescription(editing.description);
    setDate(editing.date);
  }, [editing]);

  const locked = editing ? isLocked(editing) : false;
  const options = categoriesFor(type);
  const amount = parseCurrencyInput(amountText);

  function changeType(next: TransactionType) {
    setType(next);
    setCategoryId(categoriesFor(next)[0]!.id);
  }

  function shiftDay(days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    if (startOfDay(next) > startOfDay(new Date())) return; // sem datas futuras
    setDate(next);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const input = { type, amount, categoryId, description: description.trim(), date };
      if (editing) await update(editing, input);
      else await add(input);
      router.back();
    } catch (e) {
      showMessage('Não foi possível salvar', getErrorMessage(e));
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    const ok = await confirmAction('Excluir transação', 'Tem certeza? Essa ação não pode ser desfeita.', 'Excluir');
    if (!ok) return;
    try {
      await remove(editing);
      router.back();
    } catch (e) {
      showMessage('Não foi possível excluir', getErrorMessage(e));
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar
        title={editing ? 'Editar Transação' : 'Nova Transação'}
        backColor={palette.header}
        right={
          editing && !locked ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Excluir transação" onPress={handleDelete} hitSlop={10}>
              <MaterialIcons name="delete-outline" size={22} color={colors.danger} />
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.header, shadows.raised]}>
          <View style={styles.headerGlow} />
          <View style={styles.segment}>
            {(['expense', 'income'] as const).map((t) => {
              const active = type === t;
              return (
                <Pressable
                  key={t}
                  disabled={locked}
                  onPress={() => changeType(t)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={[styles.segmentItem, active && [styles.segmentActive, shadows.card], !active && { opacity: 0.8 }]}
                >
                  <MaterialIcons
                    name={t === 'expense' ? 'arrow-downward' : 'arrow-upward'}
                    size={16}
                    color={active ? palette.header : colors.white}
                  />
                  <AppText style={[styles.segmentText, { color: active ? palette.header : colors.white }]}>
                    {t === 'expense' ? 'Gasto' : 'Entrada'}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.amountBox}>
            <AppText style={styles.amountLabel}>VALOR DA TRANSAÇÃO</AppText>
            <View style={styles.amountRow}>
              <AppText style={styles.currency}>R$</AppText>
              <TextInput
                value={amountText}
                onChangeText={(t) => setAmountText(maskCurrencyInput(t))}
                placeholder="0,00"
                placeholderTextColor="rgba(255,255,255,0.6)"
                keyboardType="decimal-pad"
                editable={!locked}
                accessibilityLabel="Valor da transação"
                style={styles.amountInput}
                autoFocus={!editing}
              />
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {locked && (
            <View style={styles.lockedBox}>
              <MaterialIcons name="lock-outline" size={16} color={palette.header} />
              <AppText variant="footnote" style={{ color: palette.strong, flex: 1 }}>
                Esta transação é de um mês já fechado e não pode ser alterada (RN-03).
              </AppText>
            </View>
          )}

          <View style={{ gap: spacing.sm }}>
            <AppText style={styles.sectionLabel}>Categoria</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
              {options.map((c) => {
                const active = c.id === categoryId;
                return (
                  <Pressable
                    key={c.id}
                    disabled={locked}
                    onPress={() => setCategoryId(c.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={c.label}
                    style={styles.category}
                  >
                    <View
                      style={[
                        styles.categoryCircle,
                        { backgroundColor: active ? palette.selected : palette.chip },
                        active && styles.categoryRing,
                      ]}
                    >
                      <MaterialCommunityIcons name={c.icon} size={24} color={palette.strong} />
                    </View>
                    <AppText
                      variant="caption"
                      style={{ color: active ? palette.strong : palette.label, fontFamily: active ? fonts.semibold : fonts.regular }}
                    >
                      {c.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={{ gap: spacing.sm }}>
            <AppText style={styles.sectionLabel}>Detalhes</AppText>
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialCommunityIcons name="text-box-edit-outline" size={18} color={palette.header} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" style={{ color: palette.label }}>
                    Descrição
                  </AppText>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Ex.: Jantar no Outback"
                    placeholderTextColor="#B8A7A2"
                    editable={!locked}
                    accessibilityLabel="Descrição"
                    style={styles.detailInput}
                    maxLength={60}
                  />
                </View>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialCommunityIcons name="calendar-blank-outline" size={18} color={palette.header} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" style={{ color: palette.label }}>
                    Data
                  </AppText>
                  <View style={styles.dateRow}>
                    <AppText style={styles.detailValue}>{dateLabel(date)}</AppText>
                    {!locked && (
                      <View style={styles.dateButtons}>
                        <Pressable accessibilityLabel="Dia anterior" onPress={() => shiftDay(-1)} hitSlop={8}>
                          <MaterialIcons name="chevron-left" size={24} color={palette.label} />
                        </Pressable>
                        <Pressable accessibilityLabel="Próximo dia" onPress={() => shiftDay(1)} hitSlop={8}>
                          <MaterialIcons name="chevron-right" size={24} color={palette.label} />
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <View style={styles.between}>
              <AppText style={styles.sectionLabel}>Anexos</AppText>
              <AppText variant="caption" style={{ color: palette.header }}>
                Opcional
              </AppText>
            </View>
            <Pressable
              onPress={() => showMessage('Anexos', 'Em breve você poderá fotografar o comprovante.')}
              style={styles.attach}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="camera-plus-outline" size={22} color="#77574E" />
              <AppText style={{ fontSize: 10, lineHeight: 15, color: '#77574E' }}>Câmera</AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {!locked && (
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [styles.save, (pressed || saving) && { opacity: 0.8 }]}
            testID="save-transaction"
          >
            <MaterialIcons name="check-circle-outline" size={20} color={colors.white} />
            <AppText style={styles.saveText}>{saving ? 'Salvando…' : 'Salvar Transação'}</AppText>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  scroll: { paddingBottom: 120 },
  header: {
    backgroundColor: palette.header,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.xxl,
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    right: -32,
    bottom: -64,
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  segment: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 320,
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(248,233,230,0.2)',
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  segmentActive: { backgroundColor: palette.background },
  segmentText: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.41 },
  amountBox: { alignItems: 'center' },
  amountLabel: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0.65, color: 'rgba(255,255,255,0.8)', marginBottom: spacing.sm },
  amountRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  currency: { fontFamily: fonts.regular, fontSize: 24, lineHeight: 32, color: colors.white, paddingTop: 4, paddingRight: 4 },
  amountInput: {
    fontFamily: fonts.bold,
    fontSize: 48,
    color: colors.white,
    textAlign: 'center',
    minWidth: 120,
    maxWidth: 240,
    padding: 0,
    outlineStyle: 'none',
  } as object,
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, gap: spacing.xxl },
  lockedBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: palette.selected,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  sectionLabel: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 20, letterSpacing: -0.24, color: palette.label },
  categories: { gap: 12, paddingVertical: 4, paddingHorizontal: 4 },
  category: { alignItems: 'center', gap: spacing.sm, minWidth: 72 },
  categoryCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  categoryRing: { borderWidth: 4, borderColor: 'rgba(255,219,209,0.35)' },
  details: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.lg },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,219,209,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailInput: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.41,
    color: palette.strong,
    paddingVertical: 2,
    marginTop: 4,
    outlineStyle: 'none',
  } as object,
  detailValue: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 22, letterSpacing: -0.41, color: palette.strong },
  detailDivider: { height: 1, backgroundColor: palette.divider, marginLeft: 72 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  dateButtons: { flexDirection: 'row', gap: spacing.xs },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  attach: {
    width: 96,
    height: 96,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D8C2BD',
    backgroundColor: '#F8E9E6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: 'rgba(255,248,246,0.95)',
  },
  save: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.raised,
  },
  saveText: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.41, color: colors.white },
});
