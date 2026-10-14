
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CreateGoalScreen } from '../../features/goals/presentation/screens/CreateGoalScreen';
import { GoalDetailsScreen } from '../../features/goals/presentation/screens/GoalDetailsScreen';
import { GoalStatementScreen } from '../../features/goals/presentation/screens/GoalStatementScreen';
import { InviteMembersScreen } from '../../features/goals/presentation/screens/InviteMembersScreen';

import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

import {
    MockAuthProvider,
    useMockAuth,
} from './MockAuthContext';

import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * Navegação da área autenticada.
 */
function MainStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="MainTabs"
                component={MainTabs}
            />

            <Stack.Screen
                name="CreateGoal"
                component={CreateGoalScreen}
            />

            <Stack.Screen
                name="GoalDetails"
                component={GoalDetailsScreen}
            />

            <Stack.Screen
                name="GoalStatement"
                component={GoalStatementScreen}
            />

            <Stack.Screen
                name="InviteMembers"
                component={InviteMembersScreen}
            />
        </Stack.Navigator>
    );
}

/**
 * Seleciona o fluxo conforme o estado
 * da sessão simulada.
 */
function AppNavigator() {
    const { isAuthenticated } = useMockAuth();

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
}

/**
 * Navegador raiz do MoneyWise.
 */
export function RootNavigator() {
    return (
        <MockAuthProvider>
            <AppNavigator />
        </MockAuthProvider>
    );
}
