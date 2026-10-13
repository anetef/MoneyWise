import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../../features/reports/presentation/screens/DashboardScreen';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    colors,
    radius,
    spacing,
    typography,
} from '../theme';

import type { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

/**
 * Placeholder temporário de Caixinhas.
 */
function GoalsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Caixinhas</Text>

            <Text style={styles.description}>
                Acompanhe suas metas financeiras.
            </Text>

            <View style={styles.card}>
                <Text style={styles.cardLabel}>
                    Reserva de emergência
                </Text>

                <Text style={styles.cardValue}>
                    R$ 7.500,00
                </Text>

                <Text style={styles.cardDescription}>
                    Meta simulada para desenvolvimento.
                </Text>
            </View>
        </View>
    );
}

/**
 * Placeholder temporário do Perfil.
 */
function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Perfil</Text>

            <Text style={styles.description}>
                Gerencie suas informações e preferências.
            </Text>

            <View style={styles.card}>
                <Text style={styles.cardLabel}>
                    Usuário de demonstração
                </Text>

                <Text style={styles.cardDescription}>
                    Configurações disponíveis em breve.
                </Text>
            </View>
        </View>
    );
}

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
                component={DashboardScreen}
                options={{
                    title: 'Painel',
                }}
            />

            <Tab.Screen
                name="Goals"
                component={GoalsScreen}
                options={{
                    title: 'Caixinhas',
                }}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Perfil',
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.xxl,
        paddingTop: spacing.massive,
    },

    title: {
        ...typography.heading,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },

    description: {
        ...typography.body,
        color: colors.text.secondary,
        marginBottom: spacing.xxl,
    },

    card: {
        backgroundColor: colors.surface.primary,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border.default,
        padding: spacing.xxl,
        gap: spacing.sm,
    },

    cardLabel: {
        ...typography.subtitle,
        color: colors.text.primary,
    },

    cardValue: {
        ...typography.title,
        color: colors.primary,
    },

    cardDescription: {
        ...typography.caption,
        color: colors.text.secondary,
    },
});