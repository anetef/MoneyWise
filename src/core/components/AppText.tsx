import { Text, type TextProps } from 'react-native';

import { colors, typography, type ColorToken, type TypographyVariant } from '@/core/theme';

type Props = TextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
};

/** Texto padrão do app: aplica a fonte Inter e os tamanhos do Figma. */
export function AppText({ variant = 'body', color = 'text', align, style, ...rest }: Props) {
  return (
    <Text
      style={[typography[variant], { color: colors[color] }, align && { textAlign: align }, style]}
      {...rest}
    />
  );
}
