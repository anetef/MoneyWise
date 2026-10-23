import { Switch } from 'react-native';

import { colors } from '../../../../core/theme';

/**
 * Interruptor ainda indisponível (campos pendentes de L-08).
 */
export function DisabledSwitch() {
    return (
        <Switch
            value={false}
            disabled
            trackColor={{ false: colors.border.default, true: colors.primary }}
            thumbColor={colors.white}
        />
    );
}
