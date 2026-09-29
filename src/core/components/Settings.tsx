import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Children, Fragment, type ComponentProps, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { colors, radius, shadows, spacing } from '@/core/theme';
import { AppText } from './AppText';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Seção de configurações: título em caixa alta + cartão com linhas. */
export function SettingsSection({
  title,
  aside,
  children,
}: {
  title?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.section}>
      {(title || aside) && (
        <View style={styles.sectionHeader}>
          {title ? (
            <AppText variant="overline" color="textMuted" style={styles.sectionTitle}>
              {title}
            </AppText>
          ) : (
            <View />
          )}
          {typeof aside === 'string' ? (
            <AppText variant="caption" color="textMuted">
              {aside}
            </AppText>
          ) : (
            aside
          )}
        </View>
      )}
      <View style={[styles.card, shadows.card]}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={styles.divider} />}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

type RowProps = {
  icon?: IconName;
  label: string;
  description?: string;
  /** Valor mostrado à direita (ex.: "R$ 6.000,00"). */
  value?: string;
  valueColor?: string;
  onPress?: () => void;
  chevron?: boolean;
  danger?: boolean;
  right?: ReactNode;
  children?: ReactNode;
};

/** Linha de configuração: ícone, rótulo, descrição e valor/controle à direita. */
export function SettingRow({
  icon,
  label,
  description,
  value,
  valueColor,
  onPress,
  chevron,
  danger,
  right,
  children,
}: RowProps) {
  const labelColor = danger ? colors.danger : colors.text;
  const content = (
    <>
      <View style={styles.rowMain}>
        {icon && <MaterialCommunityIcons name={icon} size={20} color={danger ? colors.danger : colors.primary} />}
        <View style={styles.flex}>
          <AppText variant="headline" style={{ color: labelColor, fontSize: 16 }}>
            {label}
          </AppText>
          {description && (
            <AppText variant="caption" color="textMuted">
              {description}
            </AppText>
          )}
        </View>
        {value !== undefined && (
          <AppText variant="headline" style={{ color: valueColor ?? colors.text }} numberOfLines={1}>
            {value}
          </AppText>
        )}
        {right}
        {chevron && <MaterialIcons name="chevron-right" size={22} color={danger ? colors.danger : colors.textMuted} />}
      </View>
      {children}
    </>
  );

  // Sem ação: usa View comum (um Pressable desabilitado marcaria os campos internos como desabilitados).
  if (!onPress) return <View style={styles.row}>{content}</View>;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.background }]}
    >
      {content}
    </Pressable>
  );
}

/** Interruptor liga/desliga com as cores do tema. */
export function Toggle({
  value,
  onValueChange,
  accessibilityLabel,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  accessibilityLabel: string;
}) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor={colors.white}
      {...(Platform.OS === 'web' ? { activeThumbColor: colors.white } : {})}
      ios_backgroundColor={colors.border}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { gap: spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: { fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 44 },
  row: { paddingHorizontal: spacing.lg, paddingVertical: 14 },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
