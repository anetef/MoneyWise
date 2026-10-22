import type { NavigatorScreenParams } from '@react-navigation/native';

/** Rotas de onboarding e autenticação. */
export type AuthStackParamList = {
    OnboardingStep1: undefined;
    OnboardingStep2: undefined;
    OnboardingStep3: undefined;

    Welcome: undefined;
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

/** Abas principais do aplicativo. */
export type MainTabsParamList = {
    Dashboard: undefined;

    /**
     * Ao voltar da criação, abre a aba
     * do tipo da Caixinha criada.
     */
    Goals: { createdGoalType?: 'individual' | 'shared' } | undefined;

    Profile: undefined;
};

/**
 * Navegação principal do aplicativo.
 *
 * Inclui as abas e as telas adicionais
 * acessadas a partir delas.
 */
export type MainStackParamList = {
    MainTabs: NavigatorScreenParams<MainTabsParamList>;

    GoalDetails: {
        goalId: string;
    };

    GoalStatement: {
        goalId: string;
    };

    GoalSettings: {
        goalId: string;
    };

    /**
     * Registrar Aporte (MGO-06), "Entrada" ou "Retirada" na
     * Caixinha individual. Sem `kind`, abre como entrada.
     */
    GoalContribution: {
        goalId: string;
        kind?: 'deposit' | 'withdrawal';
    };

    InviteMembers: {
        groupId: string;
    };

    CreateGoal: undefined;
};

/**
 * Rotas do navegador raiz.
 *
 * A sessão determina qual fluxo
 * estará disponível ao usuário.
 */
export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainStackParamList>;
};

export type DashboardStackParamList = {
    DashboardHome: undefined;
    Statement: undefined;
    AddTransaction: undefined;
};