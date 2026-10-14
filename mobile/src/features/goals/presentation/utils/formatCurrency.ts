/**
 * Formata um valor em reais no padrão brasileiro.
 *
 * Ex.: 8500 → "R$ 8.500,00"
 */
export function formatCurrency(value: number): string {
    const [integerPart, decimalPart] = Math.abs(value).toFixed(2).split('.');
    const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const sign = value < 0 ? '- ' : '';

    return `${sign}R$ ${withThousands},${decimalPart}`;
}
