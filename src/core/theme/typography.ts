import type { TextStyle } from 'react-native';

/**
 * Família Inter (a mesma do Figma). Os nomes abaixo são os registrados em
 * `useAppFonts()` — no React Native cada peso é uma "fonte" separada.
 */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/** Estilos de texto reaproveitados em todas as telas (valores do Figma). */
export const typography = {
  display: { fontFamily: fonts.bold, fontSize: 40, lineHeight: 50, letterSpacing: -1 },
  h1: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  h2: { fontFamily: fonts.semibold, fontSize: 28, lineHeight: 34, letterSpacing: -0.7 },
  h3: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, letterSpacing: 0.35 },
  title: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, letterSpacing: -0.45 },
  headline: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20, letterSpacing: -0.24 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, letterSpacing: -0.075 },
  bodyLarge: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24, letterSpacing: -0.17 },
  callout: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  button: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20, letterSpacing: -0.15 },
  footnote: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  overline: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  label: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 0.44 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
