
import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

type MockAuthContextValue = {
    isAuthenticated: boolean;
    signIn: () => void;
    signOut: () => void;
};

const MockAuthContext = createContext<
    MockAuthContextValue | undefined
>(undefined);

/**
 * Gerencia a sessão simulada do MoneyWise.
 * Será substituído futuramente pelo mecanismo de autenticação real do projeto.
 */
export function MockAuthProvider({
                                     children,
                                 }: {
    children: ReactNode;
}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const value = useMemo(
        () => ({
            isAuthenticated,
            signIn: () => setIsAuthenticated(true),
            signOut: () => setIsAuthenticated(false),
        }),
        [isAuthenticated],
    );

    return (
        <MockAuthContext.Provider value={value}>
            {children}
        </MockAuthContext.Provider>
    );
}

/**
 * Permite acessar a sessão simulada em telas e componentes do aplicativo.
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
