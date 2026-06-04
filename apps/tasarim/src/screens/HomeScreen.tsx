import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../theme/colors';
import { useTasarimStore } from '../store/useStore';
import { Starfield } from '../components/Starfield';
import { GATES } from '../data/gates';
import { TYPES } from '../data/types';
import { AUTHORITIES } from '../data/authorities';
import { sunLongitude, moonLongitude, julianDay } from '../utils/ephemeris';
import { longitudeToGate } from '../utils/humanDesign';

interface Props {
  onNavigate: (t: 'home' | 'chart' | 'report' | 'profile') => void;
}

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 5) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export function HomeScreen({ onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  const { activeProfile, chart } = useTasarimStore();

  const today = useMemo(() => {
    const jd = julianDay(new Date());
    const sun = longitudeToGate(sunLongitude(jd));
    const moon = longitudeToGate(moonLongitude(jd));
    return { sun, moon };
  }, []);

  if (!activeProfile) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 80 }]}>
        <Text style={styles.brand}>SAKİN · TASARIM</Text>
        <Text style={styles.emptyTitle}>Hoş geldin</Text>
        <Text style={styles.emptyDesc}>
          Doğum bilgilerinle kendine özel Human Design haritanı oluştur.
        </Text>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => onNavigate('profile')}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>Başla</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const t = chart ? TYPES[chart.type] : null;
  const a = chart ? AUTHORITIES[chart.authority] : null;
  const sunInfo = GATES[today.sun.gate];
  const moonInfo = GATES[today.moon.gate];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.xxl, paddingBottom: Spacing.xxl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerBlock}>
        <Starfield width={520} height={180} density={0.45} seed={5} />
        <Text style={styles.brand}>SAKİN · TASARIM</Text>
        <Text style={styles.greeting}>
          {greetingByHour()},{'\n'}{activeProfile.name}
        </Text>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
        </Text>
      </View>

      {/* Tek özet — kart değil, satırlar */}
      {chart && t && a && (
        <TouchableOpacity
          style={styles.summary}
          onPress={() => onNavigate('chart')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Haritana git"
        >
          <Text style={styles.summaryType}>{chart.type}</Text>
          <View style={styles.summaryMetaRow}>
            <Text style={styles.summaryMeta}>{chart.strategy}</Text>
            <Text style={styles.summaryMeta}>·</Text>
            <Text style={styles.summaryMeta}>{chart.profile}</Text>
            <Text style={styles.summaryMeta}>·</Text>
            <Text style={styles.summaryMeta}>{a.name.replace(' Yetki', '')}</Text>
          </View>
          <Text style={styles.summaryCTA}>Tam harita →</Text>
        </TouchableOpacity>
      )}

      {/* Bugünün transiti — ince satırlar */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Bugünün Transiti</Text>

        <TransitRow
          glyph="☉"
          gate={`${today.sun.gate}.${today.sun.line}`}
          name={sunInfo.name}
        />
        <View style={styles.hairline} />
        <TransitRow
          glyph="☽"
          gate={`${today.moon.gate}.${today.moon.line}`}
          name={moonInfo.name}
        />
      </View>

      {/* Alt linkler — minimal satırlar */}
      <View style={styles.section}>
        <NavRow
          label="Tam haritan"
          desc="Bodygraph, merkezler, kapılar"
          onPress={() => onNavigate('chart')}
        />
        <View style={styles.hairline} />
        <NavRow
          label="Haftalık rapor"
          desc="Senin için bu hafta"
          onPress={() => onNavigate('report')}
        />
      </View>
    </ScrollView>
  );
}

function TransitRow({ glyph, gate, name }: { glyph: string; gate: string; name: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowGlyph}>{glyph}</Text>
      <View style={styles.rowMid}>
        <Text style={styles.rowTitle}>{name}</Text>
        <Text style={styles.rowSub}>Kapı {gate}</Text>
      </View>
    </View>
  );
}

function NavRow({ label, desc, onPress }: { label: string; desc: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.rowMid}>
        <Text style={styles.rowTitle}>{label}</Text>
        <Text style={styles.rowSub}>{desc}</Text>
      </View>
      <Text style={styles.rowArrow}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.xl },

  empty: {
    flex: 1, alignItems: 'center', paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.background,
  },
  emptyTitle: {
    fontSize: Typography.size.xxxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: Typography.size.md, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: Typography.size.md * 1.6,
    marginBottom: Spacing.xxl,
    maxWidth: 360,
  },
  cta: {
    paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md,
    borderRadius: 999,
    borderWidth: 1, borderColor: Colors.gold,
  },
  ctaText: {
    color: Colors.gold,
    fontSize: Typography.size.md,
    letterSpacing: 0.5,
  },

  brand: {
    fontSize: 11,
    letterSpacing: 3,
    color: Colors.textMuted,
    fontWeight: Typography.weight.medium,
  },

  headerBlock: {
    marginBottom: Spacing.xxl,
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: -Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  greeting: {
    fontSize: Typography.size.xxxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    lineHeight: Typography.size.xxxl * 1.15,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    letterSpacing: 0.4,
  },

  summary: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.xxl,
  },
  summaryType: {
    fontSize: Typography.size.xxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    gap: 6,
  },
  summaryMeta: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  summaryCTA: {
    marginTop: Spacing.lg,
    fontSize: Typography.size.sm,
    color: Colors.gold,
    letterSpacing: 0.4,
  },

  section: {
    marginBottom: Spacing.xxl,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md + 2,
  },
  rowGlyph: {
    fontSize: 24,
    color: Colors.textSecondary,
    width: 40,
  },
  rowMid: { flex: 1 },
  rowTitle: {
    fontSize: Typography.size.md,
    color: Colors.text,
    fontWeight: Typography.weight.regular,
  },
  rowSub: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rowArrow: {
    fontSize: 18,
    color: Colors.textMuted,
    marginLeft: Spacing.md,
  },
  hairline: {
    height: 1,
    backgroundColor: Colors.divider,
  },
});
