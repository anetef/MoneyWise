import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Children, Fragment, useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts, radius, shadows, spacing } from '@/core/theme';
import { AppText } from './AppText';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Grupo de campos no estilo "iOS grouped" do Figma: um cartão branco
 * com vários campos separados por linhas finas.
 */
export function FormGroup({ children, tone = 'surface' }: { children: ReactNode; tone?: 'surface' | 'tint' }) {
  const items = Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.group, tone === 'tint' && styles.groupTint, shadows.card]}>
      {items.map((child, i) => (
        <Fragment key={i}>
          {i > 0 && <View style={[styles.divider, tone === 'tint' && styles.dividerTint]} />}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  icon?: IconName;
  /** Texto à direita do rótulo (ex.: "Mínimo 8 caracteres"). */
  hint?: string;
  /** Campo de senha com botão de mostrar/ocultar. */
  secure?: boolean;
  error?: string | null;
  /** 'inline' = ícone à esquerda do bloco (tela Entrar); 'stacked' = ícone junto do rótulo (Cadastro) */
  layout?: 'inline' | 'stacked';
  footer?: ReactNode;
};

/** Campo de texto com rótulo em caixa alta, como nos formulários do Figma. */
export function FormField({
  label,
  icon,
  hint,
  secure,
  error,
  layout = 'stacked',
  footer,
  style,
  ...inputProps
}: FieldProps) {
  const [hidden, setHidden] = useState(true);

  const input = (
    <View style={styles.inputRow}>
      <TextInput
        placeholderTextColor={colors.textPlaceholder}
        secureTextEntry={secure ? hidden : false}
        autoCapitalize={secure || inputProps.keyboardType === 'email-address' ? 'none' : undefined}
        style={[styles.input, layout === 'inline' && styles.inputInline, style]}
        accessibilityLabel={label}
        {...inputProps}
      />
      {secure && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
          hitSlop={10}
          onPress={() => setHidden((h) => !h)}
        >
          <MaterialCommunityIcons
            name={hidden ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>
      )}
    </View>
  );

  if (layout === 'inline') {
    return (
      <View style={[styles.field, styles.fieldInline]}>
        {icon && <MaterialCommunityIcons name={icon} size={18} color={colors.textSecondary} style={styles.inlineIcon} />}
        <View style={styles.flex}>
          <AppText variant="overline" color="textSecondary" style={styles.labelGap}>
            {label}
          </AppText>
          {input}
          {error ? <FieldError message={error} /> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <View style={styles.labelLeft}>
          {icon && <MaterialCommunityIcons name={icon} size={13} color={colors.primary} />}
          <AppText variant="overline" color="textSecondary" style={{ fontFamily: fonts.medium }}>
            {label}
          </AppText>
        </View>
        {hint && (
          <AppText variant="label" color="textSecondary">
            {hint}
          </AppText>
        )}
      </View>
      {input}
      {footer}
      {error ? <FieldError message={error} /> : null}
    </View>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <AppText variant="caption" style={styles.error} accessibilityRole="alert">
      {message}
    </AppText>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  group: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
  groupTint: { backgroundColor: 'rgba(239,244,255,0.6)' },
  divider: { height: 1, backgroundColor: colors.surfaceTintStrong, marginLeft: spacing.lg },
  dividerTint: { backgroundColor: 'rgba(220,233,255,0.4)', marginLeft: 48 },
  field: { padding: spacing.lg, gap: 6 },
  fieldInline: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 0 },
  inlineIcon: { width: 28 },
  labelGap: { marginBottom: 2 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 17,
    letterSpacing: -0.17,
    color: colors.textStrong,
    paddingVertical: 6,
    outlineStyle: 'none',
  } as object,
  inputInline: { fontSize: 15, paddingVertical: 2 },
  error: { color: colors.danger, marginTop: 2 },
});
