import { useRef, useState } from 'react';

import { goalRepository } from '../../data/MockGoalRepository';
import type { Goal, GoalType } from '../../domain/Goal';
import { formatCurrency } from '../utils/formatCurrency';

type FormErrors = {
    name?: string;
    targetAmount?: string;
    deadline?: string;
};

const MAX_AMOUNT_DIGITS = 11;

/** Aplica a máscara DD/MM/AAAA enquanto o usuário digita. */
function maskDate(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 8);

    return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
        .filter(Boolean)
        .join('/');
}

/** Converte DD/MM/AAAA em data, ou null se for inválida. */
function parseDate(value: string): Date | null {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);

    if (!match) {
        return null;
    }

    const [, day, month, year] = match.map(Number);
    const date = new Date(year, month - 1, day);

    const isSameDate =
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;

    return isSameDate ? date : null;
}

/**
 * ViewModel da criação de Caixinha.
 *
 * Valida localmente nome e valor objetivo (MGO-03)
 * e delega a criação ao Repository.
 */
export function useCreateGoal() {
    const [name, setName] = useState('');
    const [type, setType] = useState<GoalType>('individual');
    const [amountDigits, setAmountDigits] = useState('');
    const [deadlineText, setDeadlineText] = useState('');
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
        const digits = value
            .replace(/\D/g, '')
            .replace(/^0+/, '')
            .slice(0, MAX_AMOUNT_DIGITS);

        setAmountDigits(digits);
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
                deadline: validated.deadline,
            });
        } catch (error) {
            submittingRef.current = false;
            setIsSubmitting(false);
            throw error;
        }
    }

    return {
        name,
        type,
        amountText: amountDigits ? formatCurrency(targetAmount) : '',
        deadlineText,
        errors,
        isSubmitting,
        changeName,
        setType,
        changeAmount,
        changeDeadline,
        submit,
    };
}
