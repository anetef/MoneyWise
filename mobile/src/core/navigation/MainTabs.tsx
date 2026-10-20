import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { DashboardStack } from './DashboardStack';
import { GoalsListScreen } from '../../features/goals/presentation/screens/GoalsListScreen';
import { ProfileScreen } from '../../features/auth/presentation/screens/ProfileScreen';

import { colors, typography } from '../theme';
import type { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

/**
 * Navegação principal por abas.
 */
export function MainTabs() {
    return (
        <Tab.Navigator
            initialRouteName="Dashboard"
            screenOptions={{
                headerShown: false,

                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text.secondary,

                tabBarLabelStyle: {
                    ...typography.caption,
                },

                tabBarStyle: {
                    backgroundColor: colors.surface.primary,
                    borderTopColor: colors.border.default,
                    borderTopWidth: 1,
                },

                sceneStyle: {
                    backgroundColor: colors.background,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardStack}
                options={{
                    title: 'Painel',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="view-dashboard-outline"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Goals"
                component={GoalsListScreen}
                options={{
                    title: 'Caixinhas',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="piggy-bank-outline"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="account-outline"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}