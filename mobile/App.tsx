import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function App() {
  const avisar = (acao: string) => {
    Alert.alert(
      'MoneyWise',
      `${acao} estará disponível em breve.`,
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandSymbol}>W</Text>
          </View>

          <Text style={styles.brandName}>MoneyWise</Text>
        </View>

        <View style={styles.preview}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Seu dinheiro, organizado</Text>
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>DEMO</Text>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo atual</Text>
            <Text style={styles.balanceValue}>R$ 14.529,80</Text>
            <Text style={styles.balanceHint}>
              Mais clareza para suas próximas escolhas
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeading}>
                <View style={styles.smallIcon}>
                  <Text style={styles.smallIconText}>↓</Text>
                </View>
                <Text style={styles.summaryLabel}>Entradas</Text>
              </View>

              <Text style={styles.incomeValue}>R$ 8.450,00</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryHeading}>
                <View style={styles.smallIcon}>
                  <Text style={styles.smallIconText}>↑</Text>
                </View>
                <Text style={styles.summaryLabel}>Saídas</Text>
              </View>

              <Text style={styles.expenseValue}>R$ 6.337,50</Text>
            </View>
          </View>

          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalHeading}>
                <Text style={styles.goalIcon}>◎</Text>
                <Text style={styles.goalTitle}>Sua próxima conquista</Text>
              </View>
              <Text style={styles.goalPercentage}>75%</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <View style={styles.goalFooter}>
              <Text style={styles.goalDescription}>Reserva de emergência</Text>
              <Text style={styles.goalAmount}>R$ 7.500</Text>
            </View>
          </View>
        </View>

        <View style={styles.message}>
          <Text style={styles.eyebrow}>CUIDE DO PRESENTE. PLANEJE O FUTURO.</Text>

          <Text style={styles.title}>
            Seu dinheiro.{'\n'}
            <Text style={styles.titleAccent}>Suas possibilidades.</Text>
          </Text>

          <Text style={styles.description}>
            Acompanhe seus gastos, organize suas finanças e transforme
            seus planos em conquistas.
          </Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => avisar('O cadastro')}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryText}>Começar agora</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => avisar('O login')}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryText}>Já tenho uma conta</Text>
          </Pressable>

          <Text style={styles.footerHint}>
            Um passo de cada vez, na direção dos seus objetivos.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F5',
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 36,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 28,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#85401F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandSymbol: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  brandName: {
    color: '#85401F',
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.7,
  },
  preview: {
    backgroundColor: '#F0E4DD',
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAD8CD',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  previewTitle: {
    flex: 1,
    color: '#745342',
    fontSize: 12,
    fontWeight: '600',
  },
  previewBadge: {
    backgroundColor: '#E4D0C3',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  previewBadgeText: {
    color: '#745342',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#6A5850',
    fontSize: 13,
    fontWeight: '500',
  },
  balanceValue: {
    color: '#242526',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 8,
  },
  balanceHint: {
    color: '#92847D',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
  },
  summaryHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F8EAE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallIconText: {
    color: '#85401F',
    fontSize: 16,
  },
  summaryLabel: {
    color: '#6A5850',
    fontSize: 12,
  },
  incomeValue: {
    color: '#85401F',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 9,
  },
  expenseValue: {
    color: '#242526',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 9,
  },
  goalCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  goalHeading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goalIcon: {
    color: '#85401F',
    fontSize: 20,
  },
  goalTitle: {
    flex: 1,
    color: '#50443E',
    fontSize: 11,
    fontWeight: '600',
  },
  goalPercentage: {
    color: '#85401F',
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 7,
    borderRadius: 8,
    backgroundColor: '#F0E4DD',
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    width: '75%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#A46443',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 9,
  },
  goalDescription: {
    flex: 1,
    color: '#92847D',
    fontSize: 10,
  },
  goalAmount: {
    color: '#745342',
    fontSize: 10,
    fontWeight: '600',
  },
  message: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 26,
  },
  eyebrow: {
    color: '#9B715C',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#242526',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 39,
    textAlign: 'center',
  },
  titleAccent: {
    color: '#85401F',
  },
  description: {
    color: '#75665E',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 12,
    gap: 10,
  },
  primaryButton: {
    minHeight: 56,
    backgroundColor: '#85401F',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  secondaryButton: {
    minHeight: 52,
    backgroundColor: '#F0E4DD',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  secondaryText: {
    color: '#85401F',
    fontSize: 15,
    fontWeight: '600',
  },
  footerHint: {
    color: '#9B8D85',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 6,
  },
  pressed: {
    opacity: 0.75,
  },
});