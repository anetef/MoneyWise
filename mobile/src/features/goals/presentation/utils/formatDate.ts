const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

function startOfDay(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Diferença em dias de calendário entre a data e hoje. */
function daysFromToday(date: Date, now: Date): number {
    return Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
}

/** Ex.: "10:23" */
export function formatTime(isoDate: string): string {
    const date = new Date(isoDate);

    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Ex.: "05 de Setembro" */
export function formatDayMonth(isoDate: string): string {
    const date = new Date(isoDate);

    return `${pad(date.getDate())} de ${monthNames[date.getMonth()]}`;
}

/**
 * Data curta de um registro.
 *
 * Ex.: "Hoje, 10:23", "Ontem, 18:40" ou "15 de Outubro".
 */
export function formatRecordDate(isoDate: string, now = new Date()): string {
    const days = daysFromToday(new Date(isoDate), now);

    if (days === 0) {
        return `Hoje, ${formatTime(isoDate)}`;
    }

    if (days === 1) {
        return `Ontem, ${formatTime(isoDate)}`;
    }

    return formatDayMonth(isoDate);
}

/**
 * Título de um grupo de registros do mesmo dia.
 *
 * Ex.: "Hoje, 24 de Outubro" ou "15 de Outubro".
 */
export function formatDayHeader(isoDate: string, now = new Date()): string {
    const days = daysFromToday(new Date(isoDate), now);
    const dayMonth = formatDayMonth(isoDate);

    if (days === 0) {
        return `Hoje, ${dayMonth}`;
    }

    if (days === 1) {
        return `Ontem, ${dayMonth}`;
    }

    return dayMonth;
}

/** Chave do dia local, usada para agrupar registros. */
export function dayKey(isoDate: string): string {
    const date = new Date(isoDate);

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
