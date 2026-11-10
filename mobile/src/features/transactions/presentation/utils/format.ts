import { ApiError } from '../../../../core/api/apiClient';

const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** Ex.: 8500 → "R$ 8.500,00"; -12.5 → "- R$ 12,50". */
export function formatCurrency(value: number): string {
    const [integerPart, decimalPart] = Math.abs(value).toFixed(2).split('.');
    const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const sign = value < 0 ? '- ' : '';

    return `${sign}R$ ${withThousands},${decimalPart}`;
}

/** Valor com sinal: "+ R$ 450,00" para entrada, "- R$ 68,50" para gasto. */
export function formatSignedAmount(amount: number, type: 'INCOME' | 'EXPENSE'): string {
    return `${type === 'INCOME' ? '+' : '-'} ${formatCurrency(amount)}`;
}

/** Data local no formato AAAA-MM-DD (sem passar por UTC, para não mudar o dia). */
export function toIsoDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${day}`;
}

/** Mês atual no formato AAAA-MM, usado no resumo mensal. */
export function currentMonth(now = new Date()): string {
    return toIsoDate(now).slice(0, 7);
}

/** Primeiro e último dia do mês, no formato AAAA-MM-DD. */
export function monthRange(now = new Date()): { from: string; to: string } {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return { from: toIsoDate(first), to: toIsoDate(last) };
}

/** "2026-10-24" → "24/10/2026" (formato do campo de data do formulário). */
export function isoToInputDate(iso: string): string {
    const [year, month, day] = iso.split('-');

    return `${day}/${month}/${year}`;
}

/** "2026-10-24" → "Hoje, 24 de Outubro" / "Ontem, ..." / "24 de Outubro". */
export function formatDayHeader(iso: string, now = new Date()): string {
    const [year, month, day] = iso.split('-').map(Number);
    const label = `${day} de ${MONTH_NAMES[month - 1]}`;
    const showYear = year !== now.getFullYear() ? ` de ${year}` : '';

    const today = toIsoDate(now);
    const yesterday = toIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));

    if (iso === today) {
        return `Hoje, ${label}`;
    }

    if (iso === yesterday) {
        return `Ontem, ${label}`;
    }

    return `${label}${showYear}`;
}

/** "2026-10-24" → "24 Out" (linha curta do Dashboard). */
export function formatShortDate(iso: string): string {
    const [, month, day] = iso.split('-').map(Number);

    return `${day} ${MONTH_NAMES[month - 1].slice(0, 3)}`;
}

/** Converte qualquer erro da API numa mensagem amigável em português. */
export function transactionErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof ApiError)) {
        return fallback;
    }

    switch (error.code) {
        case 'NETWORK_ERROR':
            return 'Sem conexão com o servidor. Tente de novo.';
        case 'TRANSACTION_MONTH_CLOSED':
            return 'Esse mês já foi fechado e não pode mais ser alterado.';
        case 'SESSION_EXPIRED':
            return 'Sua sessão expirou. Entre novamente.';
        case 'RESOURCE_NOT_FOUND':
            return 'Essa transação não existe mais. Atualize a lista.';
        default:
            return error.fields[0]?.message ?? fallback;
    }
}
