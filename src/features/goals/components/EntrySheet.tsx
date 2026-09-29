import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText, Button } from '@/core/components';
import { colors, fonts, radius, spacing } from '@/core/theme';
import { getErrorMessage } from '@/core/utils/errors';
import { formatCurrency, maskCurrencyInput, parseCurrencyInput } from '@/core/utils/format';
import type { GoalEntryInput, GoalEntryType } from '../types';

type Props = {
  visible: boolean;
  type: GoalEntryType;
  balance: number;
  onClose: () => void;
  onSubmit: (input: GoalEntryInput) => Promise<void>;
};

/** Folha que sobe de baixo para registrar aporte (entrada) ou retirada. RF-13 */
export function EntrySheet({ visible, type, balance, onClose, onSubmit }: Props) {
  const [amountText, setAmountText] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isWithdraw = type === 'withdraw';

  useEffect(() => {
    if (visible) {
      setAmountText('');
      setDescription('');
      setError(null);
      setSaving(false);
    }
  }, [visible]);

  async function handleConfirm() {
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        type,
        amount: parseCurrencyInput(amountText),
        description: description.trim() || (isWithdraw ? 'Retirada' : 'Aporte'),
      });
      onClose();
    } catch (e) {
      setError(getErrorMessage(e));
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <AppText variant="title" color="text">
            {isWithdraw ? 'Registrar retirada' : 'Registrar entrada'}
          </AppText>
          <AppText variant="caption" color="textMuted">
            Saldo atual da caixinha: {formatCurrency(balance)}
          </AppText>

          <View style={styles.amountRow}>
            <AppText style={styles.currency}>R$</AppText>
            <TextInput
              value={amountText}
              onChangeText={(t) => setAmountText(maskCurrencyInput(t))}
              placeholder="0,00"
              placeholderTextColor={colors.primaryMuted}
              keyboardType="decimal-pad"
              accessibilityLabel="Valor"
              autoFocus
              style={styles.amount}
            />
          </View>

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={isWithdraw ? 'Motivo (ex.: imprevisto)' : 'Descrição (ex.: sobra do mês)'}
            placeholderTextColor={colors.textPlaceholder}
            accessibilityLabel="Descrição"
            style={styles.input}
            maxLength={50}
          />

          {error && (
            <AppText variant="callout" style={styles.error} accessibilityRole="alert">
              {error}
            </AppText>
          )}

          <Button
            title={isWithdraw ? 'Confirmar retirada' : 'Confirmar entrada'}
            leadingIcon={isWithdraw ? 'remove' : 'add'}
            loading={saving}
            onPress={handleConfirm}
            testID="confirm-entry"
          />
          <Button title="Cancelar" variant="ghost" onPress={onClose} style={{ height: 40 }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md },
  currency: { fontFamily: fonts.regular, fontSize: 22, color: colors.textMuted, marginRight: 6 },
  amount: {
    fontFamily: fonts.bold,
    fontSize: 40,
    color: colors.text,
    minWidth: 140,
    textAlign: 'center',
    padding: 0,
    outlineStyle: 'none',
  } as object,
  input: {
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    outlineStyle: 'none',
  } as object,
  error: { color: colors.danger, textAlign: 'center' },
});
