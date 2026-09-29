import { useCallback, useEffect, useMemo, useState } from 'react';

import { AppError } from '@/core/utils/errors';
import { useCurrentUser } from '@/features/auth/AuthContext';
import { goalRepository } from './goalRepository';
import { computeThermometer } from './thermometer';
import type { Goal, GoalEntry, GoalEntryInput, GoalInput } from './types';

/** Lista de caixinhas do usuário, separadas em individuais e compartilhadas. */
export function useGoals() {
  const user = useCurrentUser();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    setLoading(true);
    return goalRepository.subscribeAll(
      user,
      (data) => {
        setGoals(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const individual = useMemo(() => goals.filter((g) => !g.shared), [goals]);
  const shared = useMemo(() => goals.filter((g) => g.shared), [goals]);

  const create = useCallback(
    async (input: GoalInput) => {
      if (!input.name.trim()) throw new AppError('Dê um nome para a caixinha.');
      if (!(input.targetAmount > 0)) throw new AppError('Informe o valor objetivo.');
      return goalRepository.create(user, { ...input, name: input.name.trim() });
    },
    [user],
  );

  return { goals, individual, shared, loading, error, create };
}

/** Uma caixinha + histórico + ações, com as regras de permissão aplicadas. */
export function useGoal(goalId: string) {
  const user = useCurrentUser();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [entries, setEntries] = useState<GoalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const stopGoal = goalRepository.subscribeOne(
      goalId,
      (g) => {
        setGoal(g);
        setLoading(false);
      },
      () => setLoading(false),
    );
    const stopEntries = goalRepository.subscribeEntries(goalId, setEntries);
    return () => {
      stopGoal();
      stopEntries();
    };
  }, [goalId]);

  const isAdmin = goal?.adminId === user.id;
  const thermometer = useMemo(() => (goal ? computeThermometer(goal) : null), [goal]);

  const addEntry = useCallback(
    async (input: GoalEntryInput) => {
      if (!goal) return;
      if (!(input.amount > 0)) throw new AppError('Informe um valor maior que zero.');
      if (input.type === 'withdraw' && input.amount > goal.savedAmount) {
        throw new AppError('O valor da retirada é maior que o saldo da caixinha.');
      }
      await goalRepository.addEntry(goal.id, user, input);
    },
    [goal, user],
  );

  const update = useCallback(
    async (input: Partial<GoalInput>) => {
      if (!goal) return;
      // RN-04: só o criador (Admin) altera a meta de uma caixinha compartilhada.
      if (goal.shared && !isAdmin) throw new AppError('Apenas o administrador pode alterar a caixinha.');
      if (input.targetAmount !== undefined && !(input.targetAmount > 0)) {
        throw new AppError('Informe o valor objetivo.');
      }
      await goalRepository.update(goal.id, input);
    },
    [goal, isAdmin],
  );

  const invite = useCallback(
    async (email: string) => {
      if (!goal) throw new AppError('Caixinha não encontrada.');
      if (!isAdmin) throw new AppError('Apenas o administrador pode convidar membros.');
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) throw new AppError('Digite um e-mail válido.');
      if (email.trim().toLowerCase() === user.email.toLowerCase()) {
        throw new AppError('Você já participa desta caixinha.');
      }
      return goalRepository.inviteByEmail(goal.id, email);
    },
    [goal, isAdmin, user.email],
  );

  const removeMember = useCallback(
    async (memberId: string) => {
      if (!goal) return;
      if (!isAdmin) throw new AppError('Apenas o administrador pode remover membros.'); // RN-04
      if (memberId === goal.adminId) throw new AppError('O administrador não pode ser removido.');
      await goalRepository.removeMember(goal.id, memberId);
    },
    [goal, isAdmin],
  );

  const remove = useCallback(async () => {
    if (!goal) return;
    if (!isAdmin) throw new AppError('Apenas o administrador pode excluir a caixinha.');
    await goalRepository.remove(goal.id);
  }, [goal, isAdmin]);

  return { goal, entries, loading, isAdmin, thermometer, addEntry, update, invite, removeMember, remove };
}
