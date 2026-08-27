import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { MitlerHubScreen } from '../screens/MitlerHubScreen';
import { ArchiveScreen } from '../screens/ArchiveScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { GlossaryFAB } from '../components/HelpButton';
import { useLanguage } from '../i18n/useLanguage';

type Tab = 'home' | 'mitler' | 'archive' | 'profile';

// KART SEKMESİ İLK SIRADA (Sakin host isteği): uygulama açılınca doğrudan
// GÜNÜN KARTI gelsin. Host'un "Bugün" ekranındaki "kartını aç" daveti bu
// uygulamayı açıyor; liste ekranıyla karşılamak kullanıcıyı bir tık uzağa
// atıyordu. Sıra değişti + varsayılan sekme 'home' yapıldı.
const TAB_CONFIG: { key: Tab; tKey: 'tab.home' | 'tab.mitler' | 'tab.archive' | 'tab.profile'; symbol: string; activeColor: string }[] = [
  { key: 'home',    tKey: 'tab.home',    symbol: '✦',  activeColor: Colors.gold },
  { key: 'mitler',  tKey: 'tab.mitler',  symbol: '⊕',  activeColor: Colors.tealLight },
  { key: 'archive', tKey: 'tab.archive', symbol: '◈',  activeColor: Colors.purple },
  { key: 'profile', tKey: 'tab.profile', symbol: '⊙',  activeColor: Colors.sakinLavender },
];

export function TabNavigator() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigateToProfile={() => setActiveTab('profile')} />;
      case 'mitler':
        return <MitlerHubScreen onNavigateToProfile={() => setActiveTab('profile')} />;
      case 'archive':
        return <ArchiveScreen />;
      case 'profile':
        return <ProfileScreen />;
    }
  };

  return (
    <View style={styles.webRoot}>
      <View style={styles.container}>
        <View style={styles.screen}>{renderScreen()}</View>

        <GlossaryFAB />

        <View style={[
          styles.tabBar,
          { paddingBottom: insets.bottom + 4 },
          Platform.OS === 'web' && styles.tabBarWeb,
        ]}>
          {TAB_CONFIG.map(tab => {
            const isActive = activeTab === tab.key;
            const label = t(tab.tKey);
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityState={{ selected: isActive }}
              >
                <View style={[styles.tabIndicator, isActive && { backgroundColor: tab.activeColor }]} />
                <Text style={[
                  styles.tabSymbol,
                  { color: isActive ? tab.activeColor : Colors.textMuted },
                  !isActive && styles.tabSymbolInactive,
                ]}>
                  {tab.symbol}
                </Text>
                <Text style={[
                  styles.tabLabel,
                  { color: isActive ? tab.activeColor : Colors.textMuted },
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const MAX_W = 480;

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#070510' : Colors.background,
    alignItems: Platform.OS === 'web' ? 'center' : undefined,
    ...(Platform.OS === 'web' ? { height: '100vh' as any, overflow: 'hidden' as any } : {}),
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? MAX_W : undefined,
    ...(Platform.OS === 'web' ? { overflow: 'hidden' as any } : {}),
  },
  screen: {
    flex: 1,
    overflow: 'hidden' as any,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
  },
  tabBarWeb: {
    position: 'sticky' as any,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: Spacing.xs,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: -Spacing.sm - 1,
    width: 24,
    height: 2,
    borderRadius: BorderRadius.round,
    backgroundColor: 'transparent',
  },
  tabSymbol: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 2,
    fontWeight: '300',
  },
  tabSymbolInactive: {
    opacity: 0.35,
  },
  tabLabel: {
    fontSize: Typography.size.xs,
    letterSpacing: 0.3,
    fontWeight: Typography.weight.medium,
  },
});
