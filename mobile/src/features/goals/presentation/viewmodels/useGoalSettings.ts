import { useCallback, useEffect, useRef, useState } from 'react';

import { goalRepository } from '../../data/MockGoalRepository';
import type { GoalDetails } from '../../domain/Goal';
import { formatCurrency } from '../utils/formatCurrency';
import {
    isoDateToInput,
    maskDate,
    parseDate,
    toAmountDigits,
} from '../utils/goalForm';

type FormErrors = {
    name?: string;
    targetAmount?: string;
    deadline?: string;
};

/**
 * ViewModel das Configurações da Caixinha.
 *
 * Edita nome, valor objetivo e data limite; os demais
 * campos dependem de L-08. Grava no Repository simulado.
 */
export function useGoalSettings(goalId: string) {
    const [goal, setGoal] = useState<GoalDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [name, setName] = useState('');
    const [amountDigits, setAmountDigits] = useState('');
    const [deadlineText, setDeadlineText] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    // Evita salvar duas vezes com toques seguidos.
    const savingRef = useRef(false);

    const load = useCallback(async () => {
        try {
            const details = await goalRepository.getGoalDetails(goalId);

            setGoal(details);

            if (details) {
                setName(details.name);
                setAmountDigits(String(Math.round(details.targetAmount * 100)));
                setDeadlineText(isoDateToInput(details.deadline));
            }
        } finally {
            setIsLoading(false);
        }
    }, [goalId]);

    useEffect(() => {
        load();
    }, [load]);

    const targetAmount = Number(amountDigits || '0') / 100;

    function changeName(value: string) {
        setName(value);
        setErrors((current) => ({ ...current, name: undefined }));
    }

    function changeAmount(value: string) {
        setAmountDigits(toAmountDigits(value));
        setErrors((current) => ({ ...current, targetAmount: undefined }));
    }

    function changeDeadline(value: string) {
        setDeadlineText(maskDate(value));
        setErrors((current) => ({ ...current, deadline: undefined }));
    }

    function validate(): { deadline: Date | null } | null {
        const nextErrors: FormErrors = {};
        let deadline: Date | null = null;

        if (!name.trim()) {
            nextErrors.name = 'Informe o nome da caixinha.';
        }

        if (targetAmount <= 0) {
            nextErrors.targetAmount = 'Informe um valor objetivo maior que zero.';
        }

        if (deadlineText) {
            deadline = parseDate(deadlineText);

            if (!deadline) {
                nextErrors.deadline = 'Digite uma data válida no formato DD/MM/AAAA.';
            }
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0 ? { deadline } : null;
    }

    /** Salva no Repository simulado; devolve true quando gravou. */
    async function save(): Promise<boolean> {
        if (savingRef.current) {
            return false;
        }

        const validated = validate();

        if (!validated) {
            return false;
        }

        savingRef.current = true;
        setIsSaving(true);

        try {
            const updated = await goalRepository.updateGoal(goalId, {
                name: name.trim(),
                targetAmount,
                deadline: validated.deadline,
            });

            return updated !== null;
        } finally {
            savingRef.current = false;
            setIsSaving(false);
        }
    }

    return {
        goal,
        isLoading,
        name,
        amountText: amountDigits ? formatCurrency(targetAmount) : '',
        deadlineText,
        errors,
        isSaving,
        changeName,
        changeAmount,
        changeDeadline,
        save,
    };
}
