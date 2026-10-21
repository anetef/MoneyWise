import { useCallback, useEffect, useRef, useState } from 'react';

import { goalRepository } from '../../data/MockGoalRepository';
import type { GoalDetails } from '../../domain/Goal';
import { formatCurrency } from '../utils/formatCurrency';
import { toAmountDigits } from '../utils/goalForm';

type FormErrors = {
    amount?: string;
    submit?: string;
};

/**
 * ViewModel do registro de aporte na Caixinha (MGO-06).
 *
 * Valida o valor localmente e delega o registro ao
 * Repository. Saldo e progresso atualizados são lidos
 * depois pelos Detalhes; nada é calculado aqui.
 */
export function useGoalContribution(goalId: string) {
    const [goal, setGoal] = useState<GoalDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [amountDigits, setAmountDigits] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    // Evita registrar duas vezes com toques seguidos.
    const savingRef = useRef(false);

    const load = useCallback(async () => {
        try {
            setGoal(await goalRepository.getGoalDetails(goalId));
        } finally {
            setIsLoading(false);
        }
    }, [goalId]);

    useEffect(() => {
        load();
    }, [load]);

    const amount = Number(amountDigits || '0') / 100;

    function changeAmount(value: string) {
        setAmountDigits(toAmountDigits(value));
        setErrors({});
    }

    function changeDescription(value: string) {
        setDescription(value);
        setErrors((current) => ({ ...current, submit: undefined }));
    }

    /** Registra no Repository; devolve true quando gravou. */
    async function save(): Promise<boolean> {
        if (savingRef.current) {
            return false;
        }

        if (amount <= 0) {
            setErrors({ amount: 'Informe um valor maior que zero.' });
            return false;
        }

        savingRef.current = true;
        setIsSaving(true);

        try {
            // Após o sucesso o formulário permanece bloqueado,
            // pois a tela será fechada em seguida.
            await goalRepository.addContribution(goalId, {
                amount,
                description: description.trim() || undefined,
            });

            return true;
        } catch {
            savingRef.current = false;
            setIsSaving(false);
            setErrors({ submit: 'Não foi possível registrar. Tente novamente.' });

            return false;
        }
    }

    return {
        goal,
        isLoading,
        // Só o número ("180,00"); o "R$" fica fixo ao lado do campo.
        amountText: amountDigits ? formatCurrency(amount).replace('R$ ', '') : '',
        description,
        errors,
        isSaving,
        changeAmount,
        changeDescription,
        save,
    };
}
