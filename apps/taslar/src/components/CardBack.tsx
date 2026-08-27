import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme/colors';
import { CARD_WIDTH, CARD_HEIGHT } from './FlipCard';

interface CardBackProps {
  label: string;
  emoji: string;
  accentColor: string;
}

const MANDALA = '✦ ✧ ✦';

export function CardBack({ label, emoji, accentColor }: CardBackProps) {
  return (
    <View style={[styles.container, { borderColor: accentColor }]}>
      <View style={[styles.cornerTL, { borderColor: accentColor }]} />
      <View style={[styles.cornerTR, { borderColor: accentColor }]} />
      <View style={[styles.cornerBL, { borderColor: accentColor }]} />
      <View style={[styles.cornerBR, { borderColor: accentColor }]} />

      <View style={styles.outerRing}>
        <View style={[styles.innerRing, { borderColor: accentColor }]}>
          <Text style={[styles.emoji]}>{emoji}</Text>
        </View>
      </View>

      <Text style={[styles.ornament, { color: accentColor }]}>{MANDALA}</Text>

      <Text style={[styles.appName, { color: accentColor }]}>MAHUR</Text>
      <Text style={[styles.label, { color: accentColor }]}>{label}</Text>

      <Text style={[styles.ornamentBottom, { color: accentColor }]}>{MANDALA}</Text>

      <View style={[styles.lineH, { backgroundColor: accentColor, top: '20%' }]} />
      <View style={[styles.lineH, { backgroundColor: accentColor, bottom: '20%' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  cornerTL: {
    position: 'absolute', top: 12, left: 12,
    width: 20, height: 20,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderColor: Colors.gold,
  },
  cornerTR: {
    position: 'absolute', top: 12, right: 12,
    width: 20, height: 20,
    borderTopWidth: 2, borderRightWidth: 2,
    borderColor: Colors.gold,
  },
  cornerBL: {
    position: 'absolute', bottom: 12, left: 12,
    width: 20, height: 20,
    borderBottomWidth: 2, borderLeftWidth: 2,
    borderColor: Colors.gold,
  },
  cornerBR: {
    position: 'absolute', bottom: 12, right: 12,
    width: 20, height: 20,
    borderBottomWidth: 2, borderRightWidth: 2,
    borderColor: Colors.gold,
  },
  outerRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(201,168,76,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  innerRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201,168,76,0.05)',
  },
  emoji: {
    fontSize: 32,
  },
  ornament: {
    fontSize: Typography.size.md,
    letterSpacing: 6,
    marginBottom: Spacing.sm,
    opacity: 0.7,
  },
  ornamentBottom: {
    fontSize: Typography.size.md,
    letterSpacing: 6,
    marginTop: Spacing.sm,
    opacity: 0.7,
  },
  appName: {
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.bold,
    letterSpacing: 12,
  },
  label: {
    fontSize: Typography.size.sm,
    letterSpacing: 4,
    opacity: 0.8,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
  },
  lineH: {
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
    height: 1,
    opacity: 0.2,
  },
});
