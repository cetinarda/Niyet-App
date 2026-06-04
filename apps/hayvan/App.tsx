import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TabNavigator } from './src/navigation/TabNavigator';
import { AuthScreen } from './src/screens/AuthScreen';
import { useTuraStore } from './src/store/useStore';
import { Colors } from './src/theme/colors';
import { isSupabaseConfigured } from './src/lib/supabase';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { WebFooter } from './src/components/WebFooter';

function Root() {
  const { authReady, isAuthenticated } = useTuraStore();
  const [skipAuth, setSkipAuth] = useState(false);

  if (!authReady) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.gold} />
      </View>
    );
  }

  const showAuth = isSupabaseConfigured && !isAuthenticated && !skipAuth;
  if (showAuth) {
    return <AuthScreen onContinueOffline={() => setSkipAuth(true)} />;
  }

  return <TabNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <Root />
          <WebFooter />
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
