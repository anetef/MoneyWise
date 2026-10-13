import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { colors } from './src/core/theme';
import { RootNavigator } from './src/core/navigation/RootNavigator';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded) {
    return (
        <View style={styles.loading}>
          <ActivityIndicator
              size="large"
              color={colors.primary}
          />
        </View>
    );
  }

  return (
      <>
        <StatusBar style="dark" />
        <RootNavigator />
      </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
