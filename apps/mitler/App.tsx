import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TabNavigator } from './src/navigation/TabNavigator';
import { DisclaimerOverlay } from './src/components/DisclaimerOverlay';
import { installHostBackBridge } from './src/utils/backStack';

installHostBackBridge();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TabNavigator />
        <DisclaimerOverlay />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
