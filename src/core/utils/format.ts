/**
 * Formatação de valores e datas.
 * RN-09: os cálculos usam a moeda local do aparelho. Para o protótipo usamos
 * pt-BR / BRL como padrão; troque aqui quando a tela de configurações existir.
 */
const LOCALE = 'pt-BR';
const CURRENCY = 'BRL';

const currencyFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });

/** 1234.5 → "R$ 1.234,50" */
export function formatCurrency(value: number): string {
  // Intl usa espaço não separável (U+00A0); trocamos por espaço normal.
  return currencyFormatter.format(value).replace(/ /g, ' ');
}

/** Valor com sinal para listas de transações: "+ R$ 450,00" / "- R$ 68,50". */
export function formatSignedCurrency(value: number, type: 'income' | 'expense'): string {
  return `${type === 'income' ? '+' : '-'} ${formatCurrency(Math.abs(value))}`;
}

/** Converte o texto digitado ("1.234,56" ou "1234.56") em número. */
export function parseCurrencyInput(text: string): number {
  const digits = text.replace(/[^\d]/g, '');
  if (!digits) return 0;
  return Number(digits) / 100;
}

/** Formata enquanto a pessoa digita: "123456" → "1.234,56". */
export function maskCurrencyInput(text: string): string {
  const value = parseCurrencyInput(text);
  return value.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** "Hoje, 14:30" / "Ontem, 09:15" / "24 Out, 20:45" */
export function formatRelativeDate(date: Date, now: Date = new Date()): string {
  const time = date.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(date)) / 86_400_000);
  if (diffDays === 0) return `Hoje, ${time}`;
  if (diffDays === 1) return `Ontem, ${time}`;
  const month = date.toLocaleDateString(LOCALE, { month: 'short' }).replace('.', '');
  const monthLabel = month.charAt(0).toUpperCase() + month.slice(1);
  return `${date.getDate()} ${monthLabel}, ${time}`;
}

/** "24 de outubro de 2026" */
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString(LOCALE, { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Iniciais para avatares: "Maria Silva" → "MS". */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
