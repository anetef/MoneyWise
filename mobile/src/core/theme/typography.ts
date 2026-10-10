export const fontFamily = {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
} as const;

export const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 32,
} as const;

export const lineHeight = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 30,
    xxl: 32,
    xxxl: 36,
    display: 40,
} as const;

export const typography = {
    heading: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.display,
        lineHeight: lineHeight.display,
    },

    title: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.xxl,
        lineHeight: lineHeight.xxl,
    },

    subtitle: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.lg,
        lineHeight: lineHeight.lg,
    },

    body: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        lineHeight: lineHeight.md,
    },

    caption: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        lineHeight: lineHeight.sm,
    },

    button: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.md,
        lineHeight: lineHeight.md,
    },
} as const;