import type { GoalPace, GoalProgress } from '../domain/Goal';

/** Status calculado pelo backend no Termômetro (RN01). */
export type ThermometerStatus =
    | 'ATINGIDA'
    | 'VENCIDA'
    | 'SEM_APORTES'
    | 'EM_ANDAMENTO'
    | 'ADIANTADA'
    | 'NO_PRAZO'
    | 'ATRASADA';

type StatusText = {
    label: string;
    tone: GoalProgress['tone'];
    pace: GoalPace;
};

/**
 * Textos de cada status. O app só traduz o que o backend
 * calculou; nenhuma projeção é feita aqui (RN01).
 */
const STATUS_TEXT: Record<ThermometerStatus, StatusText> = {
    ATINGIDA: {
        label: 'Meta atingida',
        tone: 'positive',
        pace: {
            title: 'Meta atingida! 🎉',
            message: 'Parabéns! O valor objetivo da Caixinha foi alcançado.',
            tone: 'positive',
        },
    },
    ADIANTADA: {
        label: 'Adiantada',
        tone: 'positive',
        pace: {
            title: 'Ritmo acelerado!',
            message: 'Você está acima do ritmo planejado! Mantendo esse valor, a meta será alcançada antes do previsto.',
            tone: 'positive',
        },
    },
    NO_PRAZO: {
        label: 'No ritmo',
        tone: 'neutral',
        pace: {
            title: 'No ritmo planejado',
            message: 'Seus registros estão dentro do planejado. Mantendo esse valor, a meta será alcançada no prazo.',
            tone: 'neutral',
        },
    },
    EM_ANDAMENTO: {
        label: 'Em andamento',
        tone: 'neutral',
        pace: {
            title: 'Em andamento',
            message: 'Continue registrando para chegar ao valor objetivo.',
            tone: 'neutral',
        },
    },
    SEM_APORTES: {
        label: 'Sem registros',
        tone: 'neutral',
        pace: {
            title: 'Comece a guardar',
            message: 'Ainda não há registros nesta Caixinha. Que tal fazer a primeira entrada?',
            tone: 'neutral',
        },
    },
    ATRASADA: {
        label: 'Atrasada',
        tone: 'attention',
        pace: {
            title: 'Abaixo do ritmo',
            message: 'Os registros estão abaixo do planejado. Aumente as entradas para chegar no prazo.',
            tone: 'attention',
        },
    },
    VENCIDA: {
        label: 'Prazo vencido',
        tone: 'attention',
        pace: {
            title: 'Prazo encerrado',
            message: 'A data limite passou antes de a meta ser atingida. Você pode definir um novo prazo nas configurações.',
            tone: 'attention',
        },
    },
};

/** Status desconhecido (versão nova da API) cai num texto neutro. */
function textOf(status: string): StatusText {
    return STATUS_TEXT[status as ThermometerStatus] ?? STATUS_TEXT.EM_ANDAMENTO;
}

/** Barra de progresso do card: percentual de 0 a 100 + selo do status. */
export function toProgress(status: string, progressPercent: number | string): GoalProgress {
    const percent = Math.round(Number(progressPercent) || 0);
    const text = textOf(status);

    return {
        percent: Math.min(Math.max(percent, 0), 100),
        label: text.label,
        tone: text.tone,
    };
}

/** Card de ritmo dos detalhes. */
export function toPace(status: string): GoalPace {
    return textOf(status).pace;
}

const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** "2027-10-31" → "Outubro 2027" (formato usado nos cards). */
export function toDeadlineLabel(deadline: string | null): string | null {
    if (!deadline) {
        return null;
    }

    const [year, month] = deadline.split('-').map(Number);

    return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** Data local no formato AAAA-MM-DD (sem passar por UTC). */
export function toIsoDate(date: Date | null): string | null {
    if (!date) {
        return null;
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${day}`;
}
