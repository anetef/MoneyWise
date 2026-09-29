import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Avatar, TopBar } from '@/core/components';
import { isFirebaseConfigured } from '@/core/firebase/config';
import { colors, radius, shadows, spacing } from '@/core/theme';
import { confirmAction, showMessage } from '@/core/utils/feedback';
import { useAuth, useCurrentUser } from '@/features/auth/AuthContext';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const menu: { icon: IconName; label: string; message: string }[] = [
  { icon: 'star-outline', label: 'Plano Pro', message: 'Os planos serão definidos em uma próxima versão.' },
  { icon: 'account-outline', label: 'Dados Pessoais', message: 'Edição de dados pessoais em breve.' },
  { icon: 'bell-outline', label: 'Notificações', message: 'Lembretes e alertas de orçamento (RF-28) em breve.' },
];

/** Figma: "Meu Perfil" — logout (UC03 / RF-04) */
export function ProfileScreen() {
  const user = useCurrentUser();
  const { signOut } = useAuth();

  async function handleSignOut() {
    const ok = await confirmAction('Sair da conta', 'Deseja mesmo sair do MoneyWise?', 'Sair');
    // O layout raiz leva de volta para a tela de Boas-vindas automaticamente.
    if (ok) await signOut();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar variant="large" title="Perfil" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <Avatar name={user.name} size={96} />
          <AppText style={styles.name}>{user.name}</AppText>
          <AppText variant="bodyLarge" color="textMuted">
            {user.email}
          </AppText>
          {!isFirebaseConfigured && (
            <View style={styles.demoBadge}>
              <AppText variant="label" color="primary">
                Modo demonstração
              </AppText>
            </View>
          )}
        </View>

        <View style={[styles.card, shadows.card]}>
          {menu.map((item, i) => (
            <View key={item.label}>
              {i > 0 && <View style={styles.divider} />}
              <Pressable
                accessibilityRole="button"
                onPress={() => showMessage(item.label, item.message)}
                style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.background }]}
              >
                <View style={styles.itemIcon}>
                  <MaterialCommunityIcons name={item.icon} size={20} color={colors.primary} />
                </View>
                <AppText variant="bodyLarge" style={{ flex: 1 }}>
                  {item.label}
                </AppText>
                <MaterialIcons name="chevron-right" size={22} color={colors.primaryMuted} />
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleSignOut}
          style={({ pressed }) => [styles.logout, shadows.card, pressed && { opacity: 0.8 }]}
        >
          <MaterialIcons name="logout" size={18} color={colors.danger} />
          <AppText variant="headline" style={{ color: colors.danger }}>
            Sair da Conta
          </AppText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl + spacing.sm },
  identity: { alignItems: 'center', paddingTop: spacing.lg, gap: 4 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 22, lineHeight: 28, color: colors.text, marginTop: spacing.md },
  demoBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg, minHeight: 64 },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 68 },
  logout: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
