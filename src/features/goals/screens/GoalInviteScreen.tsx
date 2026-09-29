import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Avatar, TopBar } from '@/core/components';
import { isFirebaseConfigured } from '@/core/firebase/config';
import { routes } from '@/core/navigation/routes';
import { colors, fonts, radius, shadows, spacing } from '@/core/theme';
import { getErrorMessage } from '@/core/utils/errors';
import { showMessage } from '@/core/utils/feedback';
import { useCurrentUser } from '@/features/auth/AuthContext';
import { useGoal } from '../useGoals';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Figma: "Convidar Membros" — RF-11 (convidar via link ou e-mail) */
export function GoalInviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useCurrentUser();
  const { goal, invite } = useGoal(id);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  // Link que abre a caixinha no app (scheme "moneywise://" definido no app.json).
  const link = Linking.createURL(routes.goalDetails(id));
  const inviteText = `${user.name.split(' ')[0]} te convidou para a caixinha "${goal?.name ?? ''}" no MoneyWise! Crie sua conta com este e-mail e me avise para eu te adicionar: ${link}`;

  async function shareLink() {
    try {
      await Share.share({ message: inviteText, title: 'Convite MoneyWise' });
    } catch {
      showMessage('Não foi possível compartilhar.');
    }
  }

  async function openApp(url: string, fallbackName: string) {
    const can = await Linking.canOpenURL(url).catch(() => false);
    if (can) await Linking.openURL(url);
    else await shareLink().catch(() => showMessage(`${fallbackName} indisponível neste dispositivo.`));
  }

  async function handleAdd() {
    setAdding(true);
    setFeedback(null);
    try {
      const member = await invite(email);
      setFeedback({ ok: true, text: `${member.name} agora participa da caixinha!` });
      setEmail('');
    } catch (e) {
      setFeedback({ ok: false, text: getErrorMessage(e) });
    } finally {
      setAdding(false);
    }
  }

  const quick: { icon: IconName; label: string; onPress: () => void }[] = [
    { icon: 'message-text-outline', label: 'WhatsApp', onPress: () => openApp(`whatsapp://send?text=${encodeURIComponent(inviteText)}`, 'WhatsApp') },
    {
      icon: 'email-outline',
      label: 'E-mail',
      onPress: () => openApp(`mailto:?subject=${encodeURIComponent('Convite MoneyWise')}&body=${encodeURIComponent(inviteText)}`, 'E-mail'),
    },
    { icon: 'qrcode', label: 'QR Code', onPress: () => showMessage('QR Code', 'Convite por QR Code chega em breve.') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TopBar title="Convidar membros" backColor={colors.primary} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="bodyLarge" color="textMuted" style={{ fontSize: 18, lineHeight: 26 }}>
          Compartilhe sua caixinha e gerencie finanças em conjunto.
        </AppText>

        <View style={styles.linkCard}>
          <View style={styles.inline}>
            <MaterialIcons name="link" size={20} color={colors.primary} />
            <AppText variant="headline" color="primary" style={{ fontSize: 16 }}>
              Link de Convite
            </AppText>
          </View>
          <AppText variant="caption" color="textMuted">
            Envie o link para quem você quer convidar. Depois, adicione a pessoa pelo e-mail abaixo.
          </AppText>
          <View style={[styles.linkBox, shadows.card]}>
            <AppText variant="caption" color="textMuted" numberOfLines={1} style={{ flex: 1 }}>
              moneywise.app{routes.goalDetails(id)}
            </AppText>
            <Pressable onPress={shareLink} style={styles.copy} accessibilityRole="button">
              <MaterialIcons name="ios-share" size={16} color={colors.white} />
              <AppText variant="headline" style={{ color: colors.white }}>
                Enviar
              </AppText>
            </Pressable>
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <AppText variant="callout" color="textMuted">
            Compartilhamento Rápido
          </AppText>
          <View style={styles.quickRow}>
            {quick.map((q) => (
              <Pressable key={q.label} onPress={q.onPress} style={[styles.quick, shadows.card]} accessibilityRole="button">
                <View style={styles.quickIcon}>
                  <MaterialCommunityIcons name={q.icon} size={20} color={colors.primary} />
                </View>
                <AppText variant="callout">{q.label}</AppText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <AppText variant="headline" style={{ paddingLeft: 4 }}>
            Adicionar por e-mail
          </AppText>
          <View style={[styles.addCard, shadows.card]}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@exemplo.com"
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="E-mail do convidado"
              style={styles.input}
              onSubmitEditing={handleAdd}
            />
            <Pressable
              onPress={handleAdd}
              disabled={adding || !email.trim()}
              style={[styles.addButton, (adding || !email.trim()) && { opacity: 0.5 }]}
              accessibilityRole="button"
              testID="invite-add"
            >
              <AppText variant="headline" color="text">
                {adding ? '…' : 'Adicionar'}
              </AppText>
            </Pressable>
          </View>
          {feedback && (
            <AppText variant="callout" style={{ color: feedback.ok ? colors.success : colors.danger, paddingLeft: 4 }}>
              {feedback.text}
            </AppText>
          )}
          {!isFirebaseConfigured && (
            <AppText variant="caption" color="textMuted" style={{ paddingLeft: 4 }}>
              Modo demonstração: experimente bruno@moneywise.app ou carla@moneywise.app.
            </AppText>
          )}
        </View>

        {goal && (
          <View style={{ gap: spacing.sm }}>
            <AppText variant="headline" style={{ paddingLeft: 4 }}>
              Participantes ({goal.members.length})
            </AppText>
            <View style={[styles.list, shadows.card]}>
              {goal.members.map((m, i) => (
                <View key={m.id}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.memberRow}>
                    <Avatar name={m.name} size={44} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="headline" style={{ fontSize: 16 }}>
                        {m.name}
                      </AppText>
                      <AppText variant="caption" color="textMuted">
                        {m.email}
                      </AppText>
                    </View>
                    <View style={styles.memberTag}>
                      <AppText variant="caption" color="textMuted">
                        {m.role === 'admin' ? 'Admin' : 'Membro'}
                      </AppText>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  linkCard: { backgroundColor: '#ECE8E8', borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingLeft: spacing.md,
    padding: 6,
  },
  copy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  quick: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    paddingLeft: spacing.lg,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 8,
    outlineStyle: 'none',
  } as object,
  addButton: { backgroundColor: '#EFE0D6', paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: radius.pill },
  list: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 72 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  memberTag: { backgroundColor: colors.chip, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill },
});
