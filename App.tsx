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
  function mostrarAviso(acao: string) {
    Alert.alert(
      'MoneyWise',
      `${acao} estará disponível em breve. Esta tela é um protótipo.`,
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.indicator} />

        <View style={styles.hero}>
          <View style={styles.illustration}>
            <Text style={styles.heroCaption}>
              Boas-vindas · Entrar ou Cadastrar
            </Text>

            <View style={styles.art}>
              <View style={styles.circle} />

              <Text style={styles.leftLeaf}>🌿</Text>
              <Text style={styles.rightLeaf}>🌿</Text>

              <View style={styles.cubes}>
                <View style={[styles.cube, styles.topCube]}>
                  <Text style={styles.cubeSymbol}>✦</Text>
                </View>

                <View style={styles.bottomCubes}>
                  <View style={styles.cube}>
                    <Text style={styles.cubeSymbol}>✦</Text>
                  </View>

                  <View style={[styles.cube, styles.lightCube]}>
                    <Text style={styles.cubeSymbol}>✦</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.coins}>🪙 🪙 🪙</Text>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalIcon}>
                <Text style={styles.goalIconText}>↗</Text>
              </View>

              <View style={styles.goalContent}>
                <Text style={styles.goalLabel}>Meta Coletiva</Text>
                <Text style={styles.goalValue}>
                  R$ 18.450 guardados
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Bem-vindo ao MoneyWise</Text>

        <Text style={styles.description}>
          Controle suas finanças pessoais e construa metas
          compartilhadas sem complicação.
        </Text>

        <View style={styles.footer}>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => mostrarAviso('O cadastro')}
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                Criar nova conta
              </Text>
              <Text style={styles.arrow}>→</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => mostrarAviso('O login')}
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>
                Entrar na minha conta
              </Text>
            </Pressable>
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialButtons}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continuar com Apple"
              onPress={() => mostrarAviso('O acesso com Apple')}
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.appleIcon}>●</Text>
              <Text style={styles.socialText}>Apple</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continuar com Google"
              onPress={() => mostrarAviso('O acesso com Google')}
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 40,
  },
  indicator: {
    width: 34,
    height: 17,
    borderRadius: 20,
    backgroundColor: '#EEF4FF',
    alignSelf: 'center',
    marginBottom: 16,
  },
  hero: {
    backgroundColor: '#E4ECFF',
    padding: 8,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  illustration: {
    overflow: 'hidden',
    borderRadius: 11,
    backgroundColor: '#E8E5DF',
    padding: 5,
  },
  heroCaption: {
    fontSize: 8,
    color: '#74766F',
    textAlign: 'center',
    marginTop: 5,
  },
  art: {
    height: 195,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    width: 210,
    height: 120,
    borderRadius: 100,
    backgroundColor: '#F5F3ED',
    bottom: 12,
  },
  leftLeaf: {
    position: 'absolute',
    left: 30,
    top: 55,
    fontSize: 44,
    transform: [{ rotate: '-25deg' }],
  },
  rightLeaf: {
    position: 'absolute',
    right: 28,
    top: 60,
    fontSize: 40,
    transform: [{ rotate: '25deg' }],
  },
  cubes: {
    alignItems: 'center',
    marginTop: 4,
  },
  bottomCubes: {
    flexDirection: 'row',
    gap: 5,
  },
  cube: {
    width: 51,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#388773',
    borderWidth: 2,
    borderColor: '#74AA91',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-5deg' }],
  },
  topCube: {
    marginBottom: 3,
    backgroundColor: '#4A927C',
  },
  lightCube: {
    backgroundColor: '#68A38C',
    transform: [{ rotate: '5deg' }],
  },
  cubeSymbol: {
    color: '#F3E1A0',
    fontSize: 25,
  },
  coins: {
    position: 'absolute',
    bottom: 14,
    fontSize: 24,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 3,
  },
  goalIcon: {
    width: 27,
    height: 27,
    borderRadius: 20,
    backgroundColor: '#85401F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIconText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  goalContent: {
    flex: 1,
  },
  goalLabel: {
    color: '#465249',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.7,
  },
  goalValue: {
    color: '#172638',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: '#172638',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.8,
    marginTop: 26,
  },
  description: {
    color: '#4A554E',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 12,
  },
  actions: {
    gap: 9,
  },
  button: {
    minHeight: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryButton: {
    backgroundColor: '#85401F',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 23,
  },
  secondaryButton: {
    backgroundColor: '#EEF4FF',
  },
  secondaryButtonText: {
    color: '#172638',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 14,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#D9E5FF',
  },
  dividerText: {
    color: '#465249',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 9,
  },
  socialButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: '#EEF4FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingVertical: 12,
  },
  socialText: {
    color: '#172638',
    fontSize: 14,
  },
  appleIcon: {
    color: '#172638',
    fontSize: 20,
  },
  googleIcon: {
    color: '#4285F4',
    fontSize: 22,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.75,
  },
});