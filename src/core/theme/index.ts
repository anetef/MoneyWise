import { Platform, type ViewStyle } from 'react-native';

export { colors } from './colors';
export { fonts, typography } from './typography';
export type { ColorToken } from './colors';
export type { TypographyVariant } from './typography';

/** Espaçamentos em múltiplos de 4 (o Figma usa 4, 8, 12, 16, 24, 32). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
} as const;

/** Sombras suaves usadas nos cards do Figma. */
export const shadows = {
  card: Platform.select<ViewStyle>({
    web: { boxShadow: '0px 1px 2px rgba(0,0,0,0.05)' } as ViewStyle,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
  }),
  raised: Platform.select<ViewStyle>({
    web: { boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)' } as ViewStyle,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
  }),
  fab: Platform.select<ViewStyle>({
    web: { boxShadow: '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)' } as ViewStyle,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
  }),
} as const;
