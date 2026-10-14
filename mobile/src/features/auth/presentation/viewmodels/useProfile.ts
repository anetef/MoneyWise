import { useCallback, useEffect, useState } from 'react';

import { useMockAuth } from '../../../../core/navigation/MockAuthContext';
import { authRepository } from '../../data/MockAuthRepository';
import type { User } from '../../domain/User';

/**
 * ViewModel da tela Meu Perfil.
 */
export function useProfile() {
    const { signOut: endMockSession } = useMockAuth();

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [signOutError, setSignOutError] = useState<string | null>(null);

    const loadUser = useCallback(async () => {
        try {
            setUser(await authRepository.getCurrentUser());
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    function requestSignOut() {
        setSignOutError(null);
        setIsConfirmingSignOut(true);
    }

    function cancelSignOut() {
        if (!isSigningOut) {
            setIsConfirmingSignOut(false);
        }
    }

    /**
     * Logout simulado: encerra a sessão do MockAuthContext,
     * o que leva o RootNavigator de volta ao fluxo de entrada.
     */
    async function confirmSignOut() {
        if (isSigningOut) {
            return;
        }

        setIsSigningOut(true);
        setSignOutError(null);

        try {
            await authRepository.signOut();
            endMockSession();
        } catch {
            setIsSigningOut(false);
            setSignOutError('Não foi possível sair da conta. Tente novamente.');
        }
    }

    return {
        user,
        isLoading,
        isConfirmingSignOut,
        isSigningOut,
        signOutError,
        requestSignOut,
        cancelSignOut,
        confirmSignOut,
    };
}
