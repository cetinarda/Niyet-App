import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { ChartScreen } from '../screens/ChartScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { GlossaryScreen } from '../screens/GlossaryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useTasarimStore } from '../store/useStore';

export type Tab = 'home' | 'chart' | 'report' | 'glossary' | 'profile';

const TABS: { key: Tab; label: string; emoji: string; activeColor: string }[] = [
  { key: 'home', label: 'Bugün', emoji: '🌙', activeColor: Colors.gold },
  { key: 'chart', label: 'Harita', emoji: '✦', activeColor: Colors.purple },
  { key: 'report', label: 'Rapor', emoji: '📜', activeColor: Colors.tealSoft },
  { key: 'glossary', label: 'Sözlük', emoji: '✦', activeColor: Colors.gold },
  { key: 'profile', label: 'Profil', emoji: '👤', activeColor: Colors.teal },
];

export function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { isOnboarded, isLoading, setOnboarded, initialTab } = useTasarimStore();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [userTouched, setUserTouched] = useState(false);
  React.useEffect(() => {
    if (!userTouched) setActiveTab(initialTab);
  }, [initialTab, userTouched]);
  const go = (t: Tab) => {
    setUserTouched(true);
    setActiveTab(t);
  };

  if (isLoading) {
    return <View style={[styles.container, { backgroundColor: Colors.background }]} />;
  }

  if (!isOnboarded) {
    return <OnboardingScreen onAccept={() => setOnboarded()} />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={(t) => go(t as Tab)} />;
      case 'chart':
        return <ChartScreen onNavigate={(t) => go(t as Tab)} />;
      case 'report':
        return <ReportScreen onNavigate={(t) => go(t as Tab)} />;
      case 'glossary':
        return <GlossaryScreen />;
      case 'profile':
        return <ProfileScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screen}>
        <View style={styles.centerWrap}>{renderScreen()}</View>
      </View>

      <View style={[styles.tabBar, { paddingBottom: insets.bottom + 4 }]}>
        <View style={styles.tabBarInner}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => go(tab.key)}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`${tab.label} sekmesi`}
              >
                <Text style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : null,
                ]}>
                  {tab.label}
                </Text>
                {isActive && <View style={styles.tabDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screen: {
    flex: 1,
  },
  centerWrap: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  tabBar: {
    backgroundColor: Colors.background,
    borderTopWidth: 0,
    paddingTop: Spacing.sm,
    alignItems: 'center',
  },
  tabBarInner: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 560,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: Spacing.xs,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: Typography.size.sm,
    letterSpacing: 0.2,
    fontWeight: Typography.weight.regular,
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.text,
    fontWeight: Typography.weight.semibold,
  },
  tabDot: {
    width: 4, height: 4, borderRadius: 999,
    backgroundColor: Colors.gold,
    marginTop: 4,
  },
});
