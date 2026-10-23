import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    colors,
    fontFamily,
    fontSize,
    radius,
    shadows,
    spacing,
    typography,
} from '../../../../core/theme';

type Props = {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel?: string;
    /** Destaca a confirmação como ação destrutiva (ex.: sair da conta). */
    destructive?: boolean;
    isConfirming?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

/**
 * Diálogo de confirmação feito com o Modal do React Native,
 * com o mesmo comportamento no celular e na web.
 */
export function ConfirmDialog({
    visible,
    title,
    message,
    confirmLabel,
    cancelLabel = 'Cancelar',
    destructive = false,
    isConfirming = false,
    onConfirm,
    onCancel,
}: Props) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.backdrop}>
                <View
                    style={styles.dialog}
                    accessibilityRole="alert"
                    accessibilityViewIsModal
                >
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.actions}>
                        <Pressable
                            onPress={onCancel}
                            disabled={isConfirming}
                            accessibilityRole="button"
                            style={({ pressed }) => [
                                styles.button,
                                styles.cancelButton,
                                pressed && styles.pressed,
                            ]}
                        >
                            <Text style={styles.cancelText}>{cancelLabel}</Text>
                        </Pressable>

                        <Pressable
                            onPress={onConfirm}
                            disabled={isConfirming}
                            accessibilityRole="button"
                            style={({ pressed }) => [
                                styles.button,
                                destructive ? styles.destructiveButton : styles.confirmButton,
                                (pressed || isConfirming) && styles.pressed,
                            ]}
                        >
                            {isConfirming ? (
                                <ActivityIndicator color={colors.text.inverse} />
                            ) : (
                                <Text style={styles.confirmText}>{confirmLabel}</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(21, 36, 55, 0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxl,
    },

    dialog: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: colors.surface.primary,
        borderRadius: radius.xl,
        padding: spacing.xxl,
        gap: spacing.md,
        ...shadows.lg,
    },

    title: {
        ...typography.subtitle,
        fontFamily: fontFamily.semiBold,
        color: colors.text.primary,
    },

    message: {
        ...typography.caption,
        color: colors.text.secondary,
    },

    actions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.sm,
    },

    button: {
        flex: 1,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.md,
        paddingVertical: spacing.md,
    },

    pressed: {
        opacity: 0.85,
    },

    cancelButton: {
        backgroundColor: colors.surface.secondary,
    },

    cancelText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },

    confirmButton: {
        backgroundColor: colors.primary,
    },

    destructiveButton: {
        backgroundColor: colors.status.error,
    },

    confirmText: {
        fontFamily: fontFamily.semiBold,
        fontSize: fontSize.sm,
        color: colors.text.inverse,
    },
});
