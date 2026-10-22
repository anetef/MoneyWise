import { useCallback, useEffect, useRef, useState } from 'react';

import { goalRepository } from '../../data/MockGoalRepository';
import type { GoalDetails, GoalRecordKind } from '../../domain/Goal';
import { formatCurrency } from '../utils/formatCurrency';
import { toAmountDigits } from '../utils/goalForm';

type FormErrors = {
    amount?: string;
    submit?: string;
};

const AMOUNT_REQUIRED = 'Informe um valor maior que zero.';
const INSUFFICIENT_BALANCE = 'Saldo insuficiente na Caixinha';

/**
 * ViewModel do registro de movimento na Caixinha (MGO-06):
 * entrada (aporte) ou retirada (L-07).
 *
 * Valida o valor localmente e delega o registro ao
 * Repository. Saldo e progresso atualizados são lidos
 * depois pelos Detalhes; nada é calculado aqui.
 * Nesta etapa, a retirada existe só na Caixinha individual.
 */
export function useGoalContribution(goalId: string, initialKind: GoalRecordKind = 'deposit') {
    const [goal, setGoal] = useState<GoalDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedKind, setSelectedKind] = useState<GoalRecordKind>(initialKind);
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

    const canWithdraw = goal?.type === 'individual';
    const kind: GoalRecordKind = canWithdraw ? selectedKind : 'deposit';
    const amount = Number(amountDigits || '0') / 100;

    function changeKind(value: GoalRecordKind) {
        if (!canWithdraw || savingRef.current) {
            return;
        }

        // Mantém o valor digitado. O erro de valor vazio vale para
        // os dois tipos; saldo insuficiente e falha de envio, não.
        setSelectedKind(value);
        setErrors((current) =>
            current.amount === AMOUNT_REQUIRED ? { amount: current.amount } : {},
        );
    }

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
        if (savingRef.current || !goal) {
            return false;
        }

        if (amount <= 0) {
            setErrors({ amount: AMOUNT_REQUIRED });
            return false;
        }

        // Comparação em centavos com o saldo exibido na tela (L-07).
        if (kind === 'withdrawal' && Number(amountDigits) > Math.round(goal.accumulatedAmount * 100)) {
            setErrors({ amount: INSUFFICIENT_BALANCE });
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
                kind,
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
        kind,
        canWithdraw,
        // Só o número ("180,00"); o "R$" fica fixo ao lado do campo.
        amountText: amountDigits ? formatCurrency(amount).replace('R$ ', '') : '',
        description,
        errors,
        isSaving,
        changeKind,
        changeAmount,
        changeDescription,
        save,
    };
}
