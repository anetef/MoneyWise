import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { DashboardStackParamList } from './types';
import { DashboardScreen } from '../../features/reports/presentation/screens/DashboardScreen';
import { StatementScreen} from "../../features/reports/presentation/screens/StatementScreen";
import { AddTransactionScreen } from '../../features/transactions/screens/AddTransactionScreen'

const Stack = createNativeStackNavigator<DashboardStackParamList>();


export function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DashboardHome" component={DashboardScreen} />
            <Stack.Screen name="Statement" component={StatementScreen} />
            <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
        </Stack.Navigator>
    );
}