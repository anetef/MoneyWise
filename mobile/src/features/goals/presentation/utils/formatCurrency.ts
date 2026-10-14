type Options = {
    /** Omite os centavos quando o valor é inteiro (ex.: "R$ 4.500"). */
    compact?: boolean;
};

/**
 * Formata um valor em reais no padrão brasileiro.
 *
 * Ex.: 8500 → "R$ 8.500,00"
 */
export function formatCurrency(value: number, { compact = false }: Options = {}): string {
    const [integerPart, decimalPart] = Math.abs(value).toFixed(2).split('.');
    const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const sign = value < 0 ? '- ' : '';
    const cents = compact && decimalPart === '00' ? '' : `,${decimalPart}`;

    return `${sign}R$ ${withThousands}${cents}`;
}
