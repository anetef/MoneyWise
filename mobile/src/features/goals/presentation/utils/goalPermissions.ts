import type { GoalDetails } from '../../domain/Goal';

/**
 * O usuário logado é o Admin do grupo da Caixinha?
 *
 * Só o Admin edita a meta, convida, arquiva e remove membros
 * (RN04, L-10, L-17). Sem saber quem é o usuário, trata como
 * membro comum, que é o caso mais restrito.
 */
export function isCurrentUserAdmin(goal: GoalDetails): boolean {
    return goal.members.some((member) => member.isCurrentUser && member.role === 'admin');
}
