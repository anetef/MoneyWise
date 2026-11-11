import { subscribeToTopic } from '../../../core/realtime/realtimeClient';

/**
 * Avisa quando o Termômetro de uma Caixinha muda (RF-19).
 *
 * Depois de cada entrada ou retirada, a API publica o Termômetro
 * novo em `/topic/goals/{id}` para os membros inscritos. Só membros
 * do grupo conseguem assinar (o backend valida pelo token).
 *
 * Devolve a função que cancela a inscrição.
 */
export function watchGoalThermometer(goalId: string, onChange: () => void): () => void {
    return subscribeToTopic(`/topic/goals/${goalId}`, () => onChange());
}
