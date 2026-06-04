import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { HelpButton } from '../components/HelpButton';
import { AnimalLibraryScreen } from './AnimalLibraryScreen';
import { AnimalFinderScreen } from './AnimalFinderScreen';
import { NagualScreen } from './NagualScreen';
import { useTuraStore } from '../store/useStore';
import { useI18n } from '../i18n/useI18n';

type Panel = 'library' | 'finder' | 'nagual';

const PANELS = [
  { key: 'library' as Panel, labelKey: 'animalsHub.panels.library',  symbol: '⊕', color: Colors.tealLight, helpKey: 'totem' },
  { key: 'finder'  as Panel, labelKey: 'animalsHub.panels.finder',   symbol: '✦', color: Colors.gold,      helpKey: 'rehber' },
  { key: 'nagual'  as Panel, labelKey: 'animalsHub.panels.guidance', symbol: '◈', color: Colors.ember,     helpKey: 'nagual' },
];

export function AnimalsHubScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useTuraStore();
  const [panel, setPanel] = useState<Panel>('library');
  const { t } = useI18n();

  const active = PANELS.find(p => p.key === panel) ?? PANELS[0];
  const noClose = () => {};

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Top: eyebrow + current panel name + help */}
      <View style={styles.headerBar}>
        <Text style={styles.eyebrow}>{t('animalsHub.eyebrow' as any)}</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t(active.labelKey as any)}</Text>
          <HelpButton termKey={active.helpKey} />
        </View>
      </View>

      {/* Chip tabs — fixed height, no flex growth */}
      <View style={styles.chipWrap}>
        {PANELS.map(p => {
          const isActive = p.key === panel;
          return (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.chip,
                isActive && { borderColor: p.color, backgroundColor: p.color + '18' },
              ]}
              onPress={() => setPanel(p.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipSymbol, { color: isActive ? p.color : Colors.textMuted }]}>
                {p.symbol}
              </Text>
              <Text style={[
                styles.chipLabel,
                { color: isActive ? p.color : Colors.textMuted },
                isActive && { fontWeight: Typography.weight.semibold },
              ]}>
                {t(p.labelKey as any)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.divider} />

      {/* Panel content fills remaining space */}
      <View style={styles.body}>
        {panel === 'library' && <AnimalLibraryScreen onClose={noClose} embedded />}
        {panel === 'finder'  && <AnimalFinderScreen  onClose={noClose} embedded prefillBirthDate={profile?.birthDate} />}
        {panel === 'nagual'  && <NagualScreen        onClose={noClose} embedded />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  headerBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  eyebrow: {
    fontSize: 9,
    color: Colors.sakinLavender,
    letterSpacing: 3,
    opacity: 0.7,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 3,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.light,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },

  // Chip row: fixed row, no ScrollView, chips share space equally
  chipWrap: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundCard,
  },
  chipSymbol: { fontSize: 12 },
  chipLabel: {
    fontSize: 11,
    letterSpacing: 0.4,
  },

  divider: { height: 1, backgroundColor: Colors.divider, opacity: 0.4 },
  body: { flex: 1 },
});
