import { useRef, useState } from 'react';

import { goalRepository } from '../../data/ApiGoalRepository';
import type { Goal, GoalExtras, GoalType } from '../../domain/Goal';
import { formatCurrency } from '../utils/formatCurrency';
import { maskDate, parseDate, toAmountDigits } from '../utils/goalForm';
import { goalErrorMessage, isApiErrorCode } from '../utils/goalErrorMessage';
import { NEW_GOAL_EXTRAS } from '../utils/goalOptions';

type FormErrors = {
    name?: string;
    targetAmount?: string;
    deadline?: string;
    /** Falha ao gravar na API. */
    submit?: string;
};

/**
 * ViewModel da criação de Caixinha.
 *
 * Valida localmente nome e valor objetivo (MGO-03)
 * e delega a criação ao Repository, com os campos
 * extras da meta (L-08).
 */
export function useCreateGoal() {
    const [name, setName] = useState('');
    const [type, setType] = useState<GoalType>('individual');
    const [amountDigits, setAmountDigits] = useState('');
    const [deadlineText, setDeadlineText] = useState('');
    const [noDeadline, setNoDeadlineValue] = useState(false);
    const [extras, setExtras] = useState<GoalExtras>(NEW_GOAL_EXTRAS);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Evita criar duas vezes com toques seguidos nos dois botões.
    const submittingRef = useRef(false);

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

    function changeExtras(patch: Partial<GoalExtras>) {
        setExtras((current) => ({ ...current, ...patch }));
    }

    /** "Meta sem prazo fixo": ligar apaga a data limite. */
    function setNoDeadline(value: boolean) {
        setNoDeadlineValue(value);

        if (value) {
            setDeadlineText('');
            setErrors((current) => ({ ...current, deadline: undefined }));
        }
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

        if (deadlineText && !noDeadline) {
            deadline = parseDate(deadlineText);

            if (!deadline) {
                nextErrors.deadline = 'Digite uma data válida no formato DD/MM/AAAA.';
            }
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0 ? { deadline } : null;
    }

    async function submit(): Promise<Goal | null> {
        if (submittingRef.current) {
            return null;
        }

        const validated = validate();

        if (!validated) {
            return null;
        }

        submittingRef.current = true;
        setIsSubmitting(true);

        try {
            // Após o sucesso o formulário permanece bloqueado,
            // pois a tela será fechada em seguida.
            return await goalRepository.createGoal({
                name: name.trim(),
                type,
                targetAmount,
                deadline: noDeadline ? null : validated.deadline,
                ...extras,
            });
        } catch (error) {
            submittingRef.current = false;
            setIsSubmitting(false);

            setErrors(
                isApiErrorCode(error, 'INVALID_GOAL_DEADLINE')
                    ? { deadline: goalErrorMessage(error, '') }
                    : { submit: goalErrorMessage(error, 'Não foi possível criar a Caixinha. Tente novamente.') },
            );

            return null;
        }
    }

    return {
        name,
        type,
        amountText: amountDigits ? formatCurrency(targetAmount) : '',
        deadlineText,
        noDeadline,
        extras,
        errors,
        isSubmitting,
        changeName,
        setType,
        changeAmount,
        changeDeadline,
        setNoDeadline,
        changeExtras,
        submit,
    };
}
