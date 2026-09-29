import type { Goal } from './types';

/**
 * Motor de regras do Termômetro (RN-01 "Cálculo Térmico" / RF-18).
 *
 * Compara o quanto JÁ foi guardado com o quanto DEVERIA ter sido guardado até
 * hoje, considerando o prazo. Quanto mais adiantada a meta, mais "quente".
 */
export type ThermometerLevel = 'frozen' | 'cold' | 'warm' | 'hot' | 'done';

export type Thermometer = {
  /** 0 a 1 — quanto da meta já foi atingido. */
  progress: number;
  level: ThermometerLevel;
  label: string;
  /** Quanto falta para a meta. */
  remaining: number;
  /** Valor mensal necessário para cumprir o prazo (null sem prazo). */
  monthlyNeeded: number | null;
  /** Meses de adiantamento (+) ou atraso (-) em relação ao ritmo ideal. */
  monthsAhead: number | null;
};

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;

export function computeThermometer(goal: Goal, now = new Date()): Thermometer {
  const target = Math.max(goal.targetAmount, 0.01);
  const progress = Math.min(Math.max(goal.savedAmount / target, 0), 1);
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);

  if (progress >= 1) {
    return { progress, level: 'done', label: 'Meta concluída', remaining, monthlyNeeded: 0, monthsAhead: null };
  }

  if (!goal.deadline) {
    const level: ThermometerLevel = progress >= 0.66 ? 'hot' : progress >= 0.33 ? 'warm' : 'cold';
    return { progress, level, label: labels[level], remaining, monthlyNeeded: null, monthsAhead: null };
  }

  const totalMs = Math.max(goal.deadline.getTime() - goal.createdAt.getTime(), MS_PER_MONTH);
  const elapsedMs = Math.min(Math.max(now.getTime() - goal.createdAt.getTime(), 0), totalMs);
  const expectedProgress = elapsedMs / totalMs;
  const monthsLeft = Math.max((goal.deadline.getTime() - now.getTime()) / MS_PER_MONTH, 0);
  const monthlyNeeded = monthsLeft > 0 ? remaining / Math.ceil(monthsLeft) : remaining;

  // Diferença entre o progresso real e o esperado, convertida em meses.
  const totalMonths = totalMs / MS_PER_MONTH;
  const monthsAhead = Math.round((progress - expectedProgress) * totalMonths);

  const ratio = expectedProgress > 0 ? progress / expectedProgress : 1;
  const level: ThermometerLevel =
    ratio >= 1.1 ? 'hot' : ratio >= 0.9 ? 'warm' : ratio >= 0.5 ? 'cold' : 'frozen';

  return { progress, level, label: labels[level], remaining, monthlyNeeded, monthsAhead };
}

const labels: Record<ThermometerLevel, string> = {
  frozen: 'Meta congelada',
  cold: 'Ritmo abaixo do planejado',
  warm: 'No ritmo planejado',
  hot: 'Ritmo acelerado!',
  done: 'Meta concluída',
};
