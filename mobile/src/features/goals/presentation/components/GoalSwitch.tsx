import { Switch } from 'react-native';

import { colors } from '../../../../core/theme';

type Props = {
    value: boolean;
    onValueChange: (value: boolean) => void;
    /** Nome lido pelo leitor de tela. */
    label: string;
    disabled?: boolean;
};

/** Interruptor dos campos extras da meta (L-08). */
export function GoalSwitch({ value, onValueChange, label, disabled = false }: Props) {
    return (
        <Switch
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            trackColor={{ false: colors.border.default, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel={label}
        />
    );
}
