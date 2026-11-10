import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

import { setOnSessionExpired } from '../api/apiClient';
import { sessionStore } from '../storage/sessionStore';

type MockAuthContextValue = {
    isAuthenticated: boolean;
    signIn: () => void;
    signOut: () => void;
};

const MockAuthContext = createContext<
    MockAuthContextValue | undefined
>(undefined);

/**
 * Gerencia a sessão do MoneyWise.
 */
export function MockAuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isRestoring, setIsRestoring] = useState(true);

    useEffect(() => {
        // Ao abrir o app: se já existe token salvo, entra direto.
        Promise.all([sessionStore.getAccessToken(), sessionStore.getUser()])
            .then(([token, user]) => setIsAuthenticated(!!token && !!user))
            .catch(() => setIsAuthenticated(false))
            .finally(() => setIsRestoring(false));

        // Se a sessão expirar de vez, volta para a tela de entrada.
        setOnSessionExpired(() => setIsAuthenticated(false));
        return () => setOnSessionExpired(null);
    }, []);

    const value = useMemo(
        () => ({
            isAuthenticated,
            signIn: () => setIsAuthenticated(true),
            signOut: () => setIsAuthenticated(false),
        }),
        [isAuthenticated],
    );

    if (isRestoring) {
        return null;
    }

    return (
        <MockAuthContext.Provider value={value}>
            {children}
        </MockAuthContext.Provider>
    );
}

/**
 * Permite acessar a sessão em telas e componentes do aplicativo.
 */
export function useMockAuth() {
    const context = useContext(MockAuthContext);

    if (!context) {
        throw new Error(
            'useMockAuth deve ser usado dentro de MockAuthProvider.',
        );
    }

    return context;
}