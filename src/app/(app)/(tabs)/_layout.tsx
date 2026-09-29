import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Platform, StyleSheet, type ColorValue } from 'react-native';

import { colors, fonts } from '@/core/theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

function tabIcon(name: IconName, activeName: IconName = name) {
  return ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <MaterialCommunityIcons name={focused ? activeName : name} size={22} color={color as string} />
  );
}

/**
 * Barra de abas inferior do Figma: Painel · Caixinhas · Perfil.
 * O botão (+) de nova transação fica no Painel (componente Fab).
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.bar,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Painel', tabBarIcon: tabIcon('view-dashboard-outline', 'view-dashboard') }}
      />
      <Tabs.Screen
        name="caixinhas"
        options={{ title: 'Caixinhas', tabBarIcon: tabIcon('piggy-bank-outline', 'piggy-bank') }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: tabIcon('account-outline', 'account') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'rgba(249,249,254,0.95)',
    borderTopWidth: 0,
    height: Platform.OS === 'web' ? 80 : undefined,
    paddingTop: 8,
    ...Platform.select({
      web: { boxShadow: '0px -1px 8px rgba(0,0,0,0.04)' },
      default: { elevation: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8 },
    }),
  },
  label: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
});
