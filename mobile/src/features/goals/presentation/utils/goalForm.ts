/**
 * Máscaras e validações compartilhadas pelos formulários
 * de Caixinha (Nova Caixinha e Configurações).
 */

const MAX_AMOUNT_DIGITS = 11;

/**
 * Mantém só os dígitos do valor digitado, em centavos.
 *
 * Ex.: "R$ 6.000,00" → "600000"
 */
export function toAmountDigits(value: string): string {
    return value
        .replace(/\D/g, '')
        .replace(/^0+/, '')
        .slice(0, MAX_AMOUNT_DIGITS);
}

/** Aplica a máscara DD/MM/AAAA enquanto o usuário digita. */
export function maskDate(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 8);

    return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
        .filter(Boolean)
        .join('/');
}

/** Converte DD/MM/AAAA em data, ou null se for inválida. */
export function parseDate(value: string): Date | null {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);

    if (!match) {
        return null;
    }

    const [, day, month, year] = match.map(Number);
    const date = new Date(year, month - 1, day);

    const isSameDate =
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;

    return isSameDate ? date : null;
}

/**
 * Converte uma data AAAA-MM-DD no texto DD/MM/AAAA do formulário.
 */
export function isoDateToInput(isoDate: string | null): string {
    if (!isoDate) {
        return '';
    }

    const [year, month, day] = isoDate.split('-');

    return `${day}/${month}/${year}`;
}
