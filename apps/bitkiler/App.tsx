import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TabNavigator } from './src/navigation/TabNavigator';
import { AuthScreen } from './src/screens/AuthScreen';
import { useSakinHayvanStore } from './src/store/useStore';
import { Colors } from './src/theme/colors';
import { isSupabaseConfigured } from './src/lib/supabase';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { installHostBackBridge } from './src/utils/backStack';

function Root() {
  const { authReady, isAuthenticated } = useSakinHayvanStore();
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

installHostBackBridge();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          {/* WebFooter removed: host (sakin.life) provides its own policy footer. */}
          <Root />
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
