/**
 * Paleta "Terracotta Finance", extraída do Figma do MoneyWise.
 * Use sempre estes tokens nas telas em vez de escrever a cor direto no estilo.
 */
export const colors = {
  // Marca
  primary: '#823B18', // botões principais, destaques, ícones ativos
  primaryDark: '#72442B', // links ("Ver extrato completo")
  primarySoft: '#FFDBCD', // fundo de ícones de entrada / aportes
  primaryMuted: '#D2C4BA', // legenda secundária de gráficos

  // Fundos
  background: '#F9F9FE', // fundo das telas logadas
  backgroundAlt: '#F8F9FF', // fundo de telas de formulário (recuperar senha)
  surface: '#FFFFFF', // cards
  surfaceTint: '#EFF4FF', // botões secundários, inputs
  surfaceTintStrong: '#E5EEFF', // segmented control, divisores de formulário
  chip: '#EDEDF2', // fundo de ícones neutros

  // Texto
  text: '#1A1C1F', // títulos e valores (telas logadas)
  textStrong: '#0B1C30', // títulos (telas de autenticação)
  textMuted: '#54433C', // rótulos e legendas (telas logadas)
  textSecondary: '#565E74', // rótulos (telas de autenticação)
  textBody: '#3D4A42', // parágrafos de apoio
  textPlaceholder: '#BCCAC0',
  textSubtle: '#6D7A72',

  // Bordas e divisores
  border: '#E2E2E7',
  borderTint: '#DCE9FF',
  dot: '#BEC6E0',

  // Estados
  success: '#006948',
  successLight: '#00855B',
  danger: '#BA1A1A',
  warning: '#E0A100',

  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorToken = keyof typeof colors;
