import { useCallback, useEffect, useRef, useState } from 'react';

import { goalRepository } from '../../data/ApiGoalRepository';
import type { GoalDetails } from '../../domain/Goal';
import { formatCurrency } from '../utils/formatCurrency';
import {
    isoDateToInput,
    maskDate,
    parseDate,
    toAmountDigits,
} from '../utils/goalForm';
import { goalErrorMessage, isApiErrorCode } from '../utils/goalErrorMessage';

type FormErrors = {
    name?: string;
    targetAmount?: string;
    deadline?: string;
};

/** Resultado de uma ação: deu certo, ou a mensagem para mostrar. */
export type SettingsActionResult = { ok: true } | { ok: false; message: string | null };

/**
 * ViewModel das Configurações da Caixinha.
 *
 * Edita nome, valor objetivo e data limite; os demais
 * campos dependem de L-08. Também arquiva, exclui e sai do
 * grupo. Permissões (Admin, L-17) são validadas pelo backend.
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
            const details = await goalRepository.getGoalDetails(goalId).catch(() => null);

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

    /** Salva na API. Erro de validação local não gera mensagem (fica no campo). */
    async function save(): Promise<SettingsActionResult> {
        if (savingRef.current) {
            return { ok: false, message: null };
        }

        const validated = validate();

        if (!validated) {
            return { ok: false, message: null };
        }

        savingRef.current = true;
        setIsSaving(true);

        try {
            const updated = await goalRepository.updateGoal(goalId, {
                name: name.trim(),
                targetAmount,
                deadline: validated.deadline,
            });

            return updated
                ? { ok: true }
                : { ok: false, message: 'Essa Caixinha não existe mais.' };
        } catch (e) {
            if (isApiErrorCode(e, 'INVALID_GOAL_DEADLINE')) {
                setErrors({ deadline: goalErrorMessage(e, '') });
                return { ok: false, message: null };
            }

            return { ok: false, message: goalErrorMessage(e, 'Não foi possível salvar. Tente novamente.') };
        } finally {
            savingRef.current = false;
            setIsSaving(false);
        }
    }

    /** Executa uma ação da API travando a tela enquanto roda. */
    async function runAction(
        action: () => Promise<void>,
        fallback: string,
    ): Promise<SettingsActionResult> {
        if (savingRef.current) {
            return { ok: false, message: null };
        }

        savingRef.current = true;
        setIsSaving(true);

        try {
            await action();
            return { ok: true };
        } catch (e) {
            return { ok: false, message: goalErrorMessage(e, fallback) };
        } finally {
            savingRef.current = false;
            setIsSaving(false);
        }
    }

    /** Arquiva: sai da lista, mas guarda histórico e acumulado. */
    function archive() {
        return runAction(
            () => goalRepository.archiveGoal(goalId),
            'Não foi possível arquivar. Tente novamente.',
        );
    }

    /** Exclui de vez (só sem saldo). */
    function remove() {
        return runAction(
            () => goalRepository.deleteGoal(goalId),
            'Não foi possível excluir. Tente novamente.',
        );
    }

    /** Sai do grupo da Caixinha compartilhada. */
    function leave() {
        if (!goal) {
            return Promise.resolve<SettingsActionResult>({ ok: false, message: null });
        }

        const groupId = goal.groupId;

        return runAction(
            () => goalRepository.leaveGroup(groupId),
            'Não foi possível sair da Caixinha. Tente novamente.',
        );
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
        archive,
        remove,
        leave,
    };
}
