import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { colors, radius, spacing, typography } from '../theme';
import type { AuthStackParamList } from './types';


import { OnboardingStep1Screen } from '../../features/onboarding/presentation/screens/OnboardingStep1Screen';
import { OnboardingStep2Screen } from '../../features/onboarding/presentation/screens/OnboardingStep2Screen';
import { OnboardingStep3Screen } from '../../features/onboarding/presentation/screens/OnboardingStep3Screen';
import { WelcomeScreen } from '../../features/auth/presentation/screens/WelcomeScreen';
import { LoginScreen } from '../../features/auth/presentation/screens/LoginScreen';
import { RegisterScreen } from '../../features/auth/presentation/screens/RegisterScreen';
import { ForgotPasswordScreen } from '../../features/auth/presentation/screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

type AuthRoute = keyof AuthStackParamList;

type MockScreenProps = {
    title: string;
    description: string;
    buttons: {
        label: string;
        route: AuthRoute;
    }[];
    navigation: {
        navigate: (route: AuthRoute) => void;
    };
};

function MockScreen({
                        title,
                        description,
                        buttons,
                        navigation,
                    }: MockScreenProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            {buttons.map((button) => (
                <Pressable
                    key={button.label}
                    style={styles.button}
                    onPress={() => navigation.navigate(button.route)}
                >
                    <Text style={styles.buttonText}>
                        {button.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}

export function AuthStack() {
    return (
        <Stack.Navigator
            initialRouteName="OnboardingStep1"
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: colors.background,
                },
            }}
        >

            <Stack.Screen
                name="OnboardingStep1"
                component={OnboardingStep1Screen}
            />

            <Stack.Screen
                name="OnboardingStep2"
                component={OnboardingStep2Screen}
            />

            <Stack.Screen
                name="OnboardingStep3"
                component={OnboardingStep3Screen}
            />

            <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
            />

            <Stack.Screen
                name="Login"
                component={LoginScreen}
            />

            <Stack.Screen
                name="Register"
                component={RegisterScreen}
            />

            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
            />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.xxl,
        justifyContent: 'center',
        gap: spacing.lg,
    },
    title: {
        ...typography.heading,
        color: colors.text.primary,
        textAlign: 'center',
    },
    description: {
        ...typography.body,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xxl,
    },
    button: {
        backgroundColor: colors.primary,
        padding: spacing.lg,
        borderRadius: radius.lg,
        alignItems: 'center',
        minHeight: 52,
        justifyContent: 'center',
    },
    buttonText: {
        ...typography.button,
        color: colors.white,
    },
});