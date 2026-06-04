import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { AnimalsHubScreen } from '../screens/AnimalsHubScreen';
import { ArchiveScreen } from '../screens/ArchiveScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { GlossaryFAB } from '../components/HelpButton';
import { useI18n } from '../i18n/useI18n';

type Tab = 'home' | 'animals' | 'archive' | 'profile';

const TABS: { key: Tab; labelKey: string; symbol: string; activeColor: string }[] = [
  { key: 'home',    labelKey: 'tabs.today',    symbol: '✦',  activeColor: Colors.gold },
  { key: 'animals', labelKey: 'tabs.animals',  symbol: '⊕',  activeColor: Colors.tealLight },
  { key: 'archive', labelKey: 'tabs.archive',  symbol: '◈',  activeColor: Colors.purple },
  { key: 'profile', labelKey: 'tabs.profile',  symbol: '⊙',  activeColor: Colors.sakinLavender },
];

const TAB_BAR_H = 56; // approximate tab bar height for padding calculation
const MAX_W = 480;

export function TabNavigator() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const { t } = useI18n();

  const tabBarHeight = TAB_BAR_H + insets.bottom + 4;

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigateToProfile={() => setActiveTab('profile')} />;
      case 'animals':
        return <AnimalsHubScreen />;
      case 'archive':
        return <ArchiveScreen />;
      case 'profile':
        return <ProfileScreen />;
    }
  };

  return (
    <View style={styles.webRoot}>
      <View style={[styles.container, Platform.OS === 'web' && { height: winH }]}>

        {/* Screen area — fills space above tab bar */}
        <View style={styles.screen}>
          {renderScreen()}
        </View>

        <GlossaryFAB />

        {/* Tab bar — always at bottom, never scrolls */}
        <View style={[styles.tabBar, { paddingBottom: insets.bottom + 4 }]}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityLabel={t(tab.labelKey as any)}
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
                  {t(tab.labelKey as any)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#070510' : Colors.background,
    alignItems: Platform.OS === 'web' ? 'center' : undefined,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? MAX_W : undefined,
    // flexDirection column is default; screen (flex:1) takes all space, tabBar sits below
  },
  screen: {
    flex: 1,
    // minHeight:0 is the CSS flex fix: prevents flex children from overflowing
    // their container when content is taller than available space
    minHeight: 0,
    overflow: 'hidden' as any,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
    // flexShrink:0 ensures tab bar never shrinks/disappears under pressure from screen content
    flexShrink: 0,
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
